"""
Egress & Occupant Load Calculator - Enhanced Streamlit Version
Professional IBC-based calculations for architectural design
Features: Multi-building support, unit conversion, project save/load, calculation history
"""

import streamlit as st
import json
import pandas as pd
from datetime import datetime
import base64
import io
from typing import Dict, List, Tuple, Optional
import math

# Version info
__version__ = "2.1.0"
__build_date__ = "2025-08-03"
__changelog__ = {
    "2.1.0": [
        "Added step-by-step calculation logic with educational transparency",
        "Enhanced calculation explanations with IBC code references",
        "Added design recommendations based on calculated values",
        "Fixed NoneType error in travel distance comparison",
        "Improved calculation summary for export"
    ],
    "2.0.0": [
        "Complete rewrite in Python/Streamlit",
        "Multi-building project support",
        "Unit conversion (Imperial/Metric)",
        "Project save/load functionality",
        "Calculation history tracking",
        "Professional UI with code references"
    ]
}

# Configure Streamlit page
st.set_page_config(
    page_title="Egress & Occupant Load Calculator",
    page_icon="🏗️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# IBC Occupant Load Factors (sq. ft. per occupant)
IBC_DATA = {
    "2021": {
        "Assembly (Less Concentrated)": 15,
        "Assembly (Standing Space)": 5,
        "Business": 150,
        "Educational": 20,
        "Mercantile": 60,
        "Residential": 200
    },
    "2018": {
        "Assembly (Less Concentrated)": 15,
        "Assembly (Standing Space)": 5,
        "Business": 150,
        "Educational": 20,
        "Mercantile": 60,
        "Residential": 200
    },
    "2015": {
        "Assembly (Less Concentrated)": 15,
        "Assembly (Standing Space)": 5,
        "Business": 100,
        "Educational": 20,
        "Mercantile": 60,
        "Residential": 200
    },
    "2012": {
        "Assembly (Less Concentrated)": 15,
        "Assembly (Standing Space)": 5,
        "Business": 100,
        "Educational": 20,
        "Mercantile": 60,
        "Residential": 200
    }
}

# Egress capacity factors (inches per occupant)
EGRESS_FACTORS = {
    "with_sprinklers": {"stairs": 0.2, "other": 0.15},
    "without_sprinklers": {"stairs": 0.3, "other": 0.2}
}

# Area type mapping (gross vs net area)
AREA_TYPES = {
    "Assembly (Less Concentrated)": "Net",
    "Assembly (Standing Space)": "Net",
    "Business": "Gross",
    "Educational": "Net",
    "Mercantile": "Gross",
    "Residential": "Gross"
}

# Unit conversion factors
UNIT_CONVERSION = {
    "area": {"to_metric": 0.092903, "to_imperial": 10.7639},
    "length": {"to_metric": 0.3048, "to_imperial": 3.28084},
    "width": {"to_metric": 25.4, "to_imperial": 0.0393701}
}

# IBC Code References
CODE_REFERENCES = {
    "occupant_load": {
        "section": "IBC 1004",
        "description": "Occupant Load",
        "link": "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1004"
    },
    "egress_width": {
        "section": "IBC 1005",
        "description": "Egress Width",
        "link": "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1005"
    },
    "exit_access": {
        "section": "IBC 1017",
        "description": "Exit Access Travel Distance",
        "link": "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1017"
    },
    "door_width": {
        "section": "IBC 1010.1.1",
        "description": "Door Width",
        "link": "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1010.1.1"
    }
}

# US States list
US_STATES = [
    "Texas", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
    "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
]

# Initialize session state
def init_session_state():
    """Initialize Streamlit session state with default values"""
    if 'current_units' not in st.session_state:
        st.session_state.current_units = 'imperial'
    if 'buildings' not in st.session_state:
        st.session_state.buildings = []
    if 'current_building_index' not in st.session_state:
        st.session_state.current_building_index = 0
    if 'project_name' not in st.session_state:
        st.session_state.project_name = ''
    if 'calculation_history' not in st.session_state:
        st.session_state.calculation_history = []
    if 'show_advanced' not in st.session_state:
        st.session_state.show_advanced = False
    if 'show_history' not in st.session_state:
        st.session_state.show_history = False

def convert_units(value: float, conversion_type: str, direction: str) -> float:
    """Convert value between imperial and metric units"""
    if not value or conversion_type not in UNIT_CONVERSION:
        return value
    
    factor = UNIT_CONVERSION[conversion_type].get(direction, 1)
    return value * factor

def get_area_factor(ibc_version: str, occupancy: str, units: str = 'imperial') -> float:
    """Get area factor adjusted for current units"""
    factor = IBC_DATA[ibc_version][occupancy]
    
    if units == 'metric':
        factor = factor * UNIT_CONVERSION["area"]["to_metric"]
    
    return factor

def calculate_occupant_load(area: float, factor: float) -> int:
    """Calculate occupant load"""
    return math.ceil(area / factor)

def calculate_egress_widths(occupant_load: int, has_sprinklers: bool) -> Dict[str, int]:
    """Calculate egress width requirements"""
    factors = EGRESS_FACTORS["with_sprinklers"] if has_sprinklers else EGRESS_FACTORS["without_sprinklers"]
    
    return {
        "stairs": math.ceil(occupant_load * factors["stairs"]),
        "other": math.ceil(occupant_load * factors["other"])
    }

def calculate_door_width(occupant_load: int, num_exits: int, has_sprinklers: bool) -> int:
    """Calculate minimum door width per exit"""
    total_width = calculate_egress_widths(occupant_load, has_sprinklers)["other"]
    width_per_door = math.ceil(total_width / num_exits)
    return max(width_per_door, 32)  # IBC minimum is 32 inches

def format_width(value: int, units: str = 'imperial') -> str:
    """Format width value for display"""
    if units == 'metric':
        mm_value = round(value * UNIT_CONVERSION["width"]["to_metric"])
        return f"{mm_value:,} mm"
    return f"{value} inches"

def format_area(value: float, units: str = 'imperial') -> str:
    """Format area value for display"""
    unit_str = "sq. m" if units == 'metric' else "sq. ft."
    return f"{value:,.2f} {unit_str}"

def generate_code_notice(state: str) -> str:
    """Generate jurisdiction-specific notice"""
    if state == "Texas":
        return """
        **Texas Jurisdiction Notice:** Texas adopts the IBC statewide, but local jurisdictions 
        like Houston, Dallas, and Austin have their own amendments and may use different code versions. 
        **Always verify with the local authority having jurisdiction.**
        """
    return """
        **Code Compliance Notice:** This calculation is based on the standard IBC. 
        **Always verify local and state-specific amendments** before finalizing any design.
        """

def generate_calculation_summary(inputs: Dict, results: Dict) -> str:
    """Generate detailed calculation summary"""
    units = st.session_state.current_units
    area_units = "sq. m" if units == 'metric' else "sq. ft."
    width_units = "mm" if units == 'metric' else "inches"
    
    summary = f"""
**PROJECT SUMMARY**
Project: {st.session_state.project_name or 'Untitled Project'}
Building: {st.session_state.current_building_index + 1} of {len(st.session_state.buildings)}
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Units: {units.title()}

**INPUT PARAMETERS**
• State/Jurisdiction: {inputs['state']}
• IBC Code Version: {inputs['ibc_version']}
• Occupancy Classification: {inputs['occupancy']}
• Floor Area: {inputs['floor_area']:,} {area_units}
• Occupant Load Factor: {inputs['occupant_load_factor']:.2f} {area_units}/occupant
• Automatic Sprinkler System: {'Yes' if inputs['has_sprinklers'] else 'No'}
"""
    
    if inputs.get('travel_distance'):
        distance_units = "m" if units == 'metric' else "ft"
        summary += f"• Max Travel Distance: {inputs['travel_distance']} {distance_units}\n"
    
    if inputs.get('exit_doors'):
        summary += f"• Number of Exit Doors: {inputs['exit_doors']}\n"
    
    summary += f"""
**CALCULATION PROCESS**
1. Occupant Load = ceil({inputs['floor_area']:,} ÷ {inputs['occupant_load_factor']:.2f}) = {results['occupant_load']} occupants
2. Stair Width = {results['occupant_load']} × {0.2 if inputs['has_sprinklers'] else 0.3} = {results['egress_widths']['stairs']} {width_units}
3. Other Components Width = {results['occupant_load']} × {0.15 if inputs['has_sprinklers'] else 0.2} = {results['egress_widths']['other']} {width_units}
"""
    
    if results.get('door_width'):
        summary += f"4. Door Width (per door) = {results['total_width']} ÷ {inputs['exit_doors']} = {results['door_width']} {width_units}\n"
    
    summary += f"""
**RESULTS**
• Occupant Load: {results['occupant_load']} occupants
• Required Stair Width: {format_width(results['egress_widths']['stairs'], units)}
• Required Other Components Width: {format_width(results['egress_widths']['other'], units)}
"""
    
    if results.get('door_width'):
        summary += f"• Minimum Door Width: {format_width(results['door_width'], units)}\n"
        summary += f"• Total Required Exit Width: {format_width(results['total_width'], units)}\n"
    
    return summary

def generate_step_by_step_calculation(inputs: Dict, results: Dict) -> List[Dict]:
    """Generate detailed step-by-step calculation breakdown"""
    units = st.session_state.current_units
    area_units = "sq. m" if units == 'metric' else "sq. ft."
    width_units = "mm" if units == 'metric' else "inches"
    
    steps = []
    
    # Step 1: Occupant Load Factor Selection
    area_type = AREA_TYPES[inputs['occupancy']]
    base_factor = IBC_DATA[inputs['ibc_version']][inputs['occupancy']]
    
    steps.append({
        'step': 1,
        'title': 'Determine Occupant Load Factor',
        'description': f"Based on {inputs['ibc_version']} IBC Table 1004.5",
        'calculation': f"Occupancy: {inputs['occupancy']}",
        'formula': f"Factor = {base_factor} sq. ft./occupant",
        'result': f"{inputs['occupant_load_factor']:.2f} {area_units}/occupant",
        'note': f"Using {area_type} area as specified by IBC for this occupancy type"
    })
    
    # Step 2: Occupant Load Calculation
    steps.append({
        'step': 2,
        'title': 'Calculate Occupant Load',
        'description': "Apply IBC Section 1004.3 - occupant load calculation",
        'calculation': f"Floor Area ÷ Occupant Load Factor",
        'formula': f"{inputs['floor_area']:,} {area_units} ÷ {inputs['occupant_load_factor']:.2f} {area_units}/occupant",
        'result': f"{inputs['floor_area'] / inputs['occupant_load_factor']:.2f} = {results['occupant_load']} occupants (rounded up)",
        'note': "Always round UP to the next whole number per IBC requirements"
    })
    
    # Step 3: Egress Capacity Factors
    stair_factor = 0.2 if inputs['has_sprinklers'] else 0.3
    other_factor = 0.15 if inputs['has_sprinklers'] else 0.2
    sprinkler_status = "with sprinklers" if inputs['has_sprinklers'] else "without sprinklers"
    
    steps.append({
        'step': 3,
        'title': 'Determine Egress Capacity Factors',
        'description': f"Based on IBC Section 1005.3.1 - {sprinkler_status}",
        'calculation': f"Building has {'automatic sprinkler system' if inputs['has_sprinklers'] else 'no sprinkler system'}",
        'formula': f"Stairs: {stair_factor} inches/occupant\nOther components: {other_factor} inches/occupant",
        'result': f"Using {sprinkler_status} factors",
        'note': "Sprinkler systems allow for reduced egress width requirements"
    })
    
    # Step 4: Stair Width Calculation
    steps.append({
        'step': 4,
        'title': 'Calculate Required Stair Width',
        'description': "Apply IBC Section 1005.3.1 for stair capacity",
        'calculation': f"Occupant Load × Stair Factor",
        'formula': f"{results['occupant_load']} occupants × {stair_factor} inches/occupant",
        'result': f"{results['occupant_load'] * stair_factor:.1f} = {results['egress_widths']['stairs']} {width_units} (rounded up)",
        'note': "Minimum stair width is typically 44 inches per IBC Section 1011.2"
    })
    
    # Step 5: Other Components Width Calculation
    steps.append({
        'step': 5,
        'title': 'Calculate Required Width for Other Components',
        'description': "Apply IBC Section 1005.3.1 for doors, corridors, etc.",
        'calculation': f"Occupant Load × Other Components Factor",
        'formula': f"{results['occupant_load']} occupants × {other_factor} inches/occupant",
        'result': f"{results['occupant_load'] * other_factor:.1f} = {results['egress_widths']['other']} {width_units} (rounded up)",
        'note': "This applies to doors, corridors, ramps, and other egress components"
    })
    
    # Step 6: Door Width Calculation (if advanced)
    if results.get('door_width') and inputs.get('exit_doors'):
        min_door_width = 32  # IBC minimum
        calculated_width = math.ceil(results['egress_widths']['other'] / inputs['exit_doors'])
        
        steps.append({
            'step': 6,
            'title': 'Calculate Individual Door Width',
            'description': "Distribute total egress width among exit doors",
            'calculation': f"Total Required Width ÷ Number of Doors",
            'formula': f"{results['egress_widths']['other']} {width_units} ÷ {inputs['exit_doors']} doors",
            'result': f"{calculated_width} {width_units} (minimum {min_door_width} inches per IBC 1010.1.1)",
            'note': f"Final door width: {results['door_width']} {width_units} (takes maximum of calculated and minimum)"
        })
    
    return steps

def save_to_history(results: Dict):
    """Save calculation to history"""
    history_item = {
        'id': datetime.now().timestamp(),
        'date': datetime.now().isoformat(),
        'project_name': st.session_state.project_name or 'Untitled Project',
        'building_index': st.session_state.current_building_index + 1,
        'inputs': results['inputs'],
        'results': {
            'occupant_load': results['occupant_load'],
            'stair_width': results['egress_widths']['stairs'],
            'other_width': results['egress_widths']['other'],
            'door_width': results.get('door_width'),
            'total_width': results.get('total_width')
        },
        'units': st.session_state.current_units
    }
    
    st.session_state.calculation_history.insert(0, history_item)
    
    # Limit history to 50 items
    if len(st.session_state.calculation_history) > 50:
        st.session_state.calculation_history = st.session_state.calculation_history[:50]

def create_download_link(data: str, filename: str, text: str) -> str:
    """Create a download link for data"""
    b64 = base64.b64encode(data.encode()).decode()
    return f'<a href="data:file/txt;base64,{b64}" download="{filename}">{text}</a>'

def main():
    """Main application function"""
    init_session_state()
    
    # Header
    st.title("🏗️ Egress & Occupant Load Calculator")
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("**Professional IBC-based calculations for architectural design**")
    with col2:
        st.markdown(f"**Version {__version__}** | *{__build_date__}*")
    
    # Sidebar for project management and settings
    with st.sidebar:
        st.header("🔧 Project Management")
        
        # Project name
        project_name = st.text_input(
            "Project Name",
            value=st.session_state.project_name,
            placeholder="Enter project name (optional)"
        )
        if project_name != st.session_state.project_name:
            st.session_state.project_name = project_name
        
        # Units toggle
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔄 Toggle Units"):
                st.session_state.current_units = 'metric' if st.session_state.current_units == 'imperial' else 'imperial'
                st.rerun()
        
        with col2:
            st.write(f"**Units:** {st.session_state.current_units.title()}")
        
        st.divider()
        
        # Building management
        st.subheader("🏢 Buildings")
        
        if not st.session_state.buildings:
            if st.button("➕ Add First Building"):
                st.session_state.buildings.append({
                    'id': datetime.now().timestamp(),
                    'name': f"Building 1",
                    'inputs': {},
                    'results': None
                })
                st.session_state.current_building_index = 0
                st.rerun()
        else:
            # Building counter and navigation
            total_buildings = len(st.session_state.buildings)
            current_building = st.session_state.current_building_index + 1
            
            st.write(f"Building **{current_building}** of **{total_buildings}**")
            
            col1, col2, col3 = st.columns(3)
            with col1:
                if st.button("⬅️") and st.session_state.current_building_index > 0:
                    st.session_state.current_building_index -= 1
                    st.rerun()
            
            with col2:
                if st.button("➕ Add"):
                    st.session_state.buildings.append({
                        'id': datetime.now().timestamp(),
                        'name': f"Building {len(st.session_state.buildings) + 1}",
                        'inputs': {},
                        'results': None
                    })
                    st.session_state.current_building_index = len(st.session_state.buildings) - 1
                    st.rerun()
            
            with col3:
                if st.button("➡️") and st.session_state.current_building_index < len(st.session_state.buildings) - 1:
                    st.session_state.current_building_index += 1
                    st.rerun()
        
        st.divider()
        
        # Project actions
        st.subheader("💾 Project Actions")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🆕 New Project"):
                st.session_state.buildings = []
                st.session_state.current_building_index = 0
                st.session_state.project_name = ""
                st.rerun()
        
        with col2:
            if st.button("📋 Show History"):
                st.session_state.show_history = not st.session_state.show_history
        
                # Export project
                if st.session_state.buildings:
                    project_data = {
                        'name': st.session_state.project_name or 'Untitled Project',
                        'buildings': st.session_state.buildings,
                        'created_date': datetime.now().isoformat(),
                        'version': __version__,
                        'app_version': __version__,
                        'exported_by': f"Egress Calculator v{__version__}"
                    }            project_json = json.dumps(project_data, indent=2)
            st.download_button(
                label="📥 Export Project",
                data=project_json,
                file_name=f"egress_project_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
        
        # Import project
        uploaded_file = st.file_uploader("📤 Import Project", type=['json'])
        if uploaded_file:
            try:
                project_data = json.load(uploaded_file)
                st.session_state.project_name = project_data['name']
                st.session_state.buildings = project_data['buildings']
                st.session_state.current_building_index = 0
                st.success(f"Project '{project_data['name']}' loaded successfully!")
                st.rerun()
            except Exception as e:
                st.error(f"Error loading project: {str(e)}")
        
        st.divider()
        
        # Advanced options toggle
        st.session_state.show_advanced = st.checkbox("🔧 Show Advanced Options", st.session_state.show_advanced)
        
        # Version info
        with st.expander("ℹ️ Version Info", expanded=False):
            st.markdown(f"**Version:** {__version__}")
            st.markdown(f"**Build Date:** {__build_date__}")
            
            if __version__ in __changelog__:
                st.markdown("**What's New:**")
                for change in __changelog__[__version__]:
                    st.markdown(f"• {change}")
            
            st.markdown("**Previous Versions:**")
            for version, changes in __changelog__.items():
                if version != __version__:
                    with st.expander(f"Version {version}", expanded=False):
                        for change in changes:
                            st.markdown(f"• {change}")
    
    # Main content area
    if not st.session_state.buildings:
        st.info("👆 Click 'Add First Building' in the sidebar to get started!")
        return
    
    # Current building inputs
    st.header("📊 Project Parameters")
    
    # Get current units labels
    area_units = "sq. m" if st.session_state.current_units == 'metric' else "sq. ft."
    distance_units = "m" if st.session_state.current_units == 'metric' else "ft"
    
    # Input form
    col1, col2 = st.columns(2)
    
    with col1:
        state = st.selectbox(
            "State/Jurisdiction",
            options=[""] + US_STATES,
            index=0,
            help="Select the state or jurisdiction for code compliance"
        )
        
        ibc_version = st.selectbox(
            "IBC Code Version",
            options=["", "2021", "2018", "2015", "2012"],
            index=0,
            help="Select the International Building Code version"
        )
        
        occupancy = st.selectbox(
            "Occupancy Classification",
            options=[""] + list(AREA_TYPES.keys()),
            index=0,
            help="Select the building occupancy type"
        )
    
    with col2:
        floor_area = st.number_input(
            f"Floor Area ({area_units})",
            min_value=0.0,
            value=0.0,
            step=1.0,
            help=f"Enter the floor area in {area_units}"
        )
        
        has_sprinklers = st.selectbox(
            "Automatic Sprinkler System",
            options=["", "Yes", "No"],
            index=0,
            help="Does the building have an automatic sprinkler system?"
        )
        
        # Show area type helper
        if occupancy:
            area_type = AREA_TYPES[occupancy]
            if area_type == "Net":
                st.info("💡 **Net area** excludes non-occupiable spaces like mechanical rooms, stairs, and walls.")
            else:
                st.info("💡 **Gross area** includes the entire floor area within the exterior walls.")
    
    # Advanced options
    if st.session_state.show_advanced:
        st.subheader("🔧 Advanced Options")
        
        col1, col2 = st.columns(2)
        with col1:
            travel_distance = st.number_input(
                f"Max Travel Distance ({distance_units})",
                min_value=0.0,
                value=0.0,
                step=1.0,
                help="Maximum travel distance for door calculations (optional)"
            )
        
        with col2:
            exit_doors = st.number_input(
                "Number of Exit Doors",
                min_value=1,
                value=2,
                step=1,
                help="Number of exit doors for distributed width calculations"
            )
    
    # Calculate button
    if st.button("🧮 Calculate Egress Requirements", type="primary", use_container_width=True):
        # Validation
        if not all([state, ibc_version, occupancy, floor_area > 0, has_sprinklers]):
            st.error("❌ Please fill in all required fields!")
            return
        
        try:
            # Get values
            has_sprinklers_bool = has_sprinklers == "Yes"
            
            # Get area factor adjusted for units
            occupant_load_factor = get_area_factor(ibc_version, occupancy, st.session_state.current_units)
            
            # Perform calculations
            occupant_load = calculate_occupant_load(floor_area, occupant_load_factor)
            egress_widths = calculate_egress_widths(occupant_load, has_sprinklers_bool)
            
            # Advanced calculations
            door_width = None
            total_width = None
            
            if st.session_state.show_advanced and exit_doors > 0:
                door_width = calculate_door_width(occupant_load, int(exit_doors), has_sprinklers_bool)
                total_width = egress_widths["other"]
            
            # Prepare results
            results = {
                'occupant_load': occupant_load,
                'egress_widths': egress_widths,
                'door_width': door_width,
                'total_width': total_width,
                'inputs': {
                    'state': state,
                    'ibc_version': ibc_version,
                    'occupancy': occupancy,
                    'floor_area': floor_area,
                    'has_sprinklers': has_sprinklers_bool,
                    'occupant_load_factor': occupant_load_factor,
                    'travel_distance': travel_distance if st.session_state.show_advanced else None,
                    'exit_doors': int(exit_doors) if st.session_state.show_advanced else None
                }
            }
            
            # Save results to current building
            if st.session_state.buildings:
                st.session_state.buildings[st.session_state.current_building_index]['results'] = results
                st.session_state.buildings[st.session_state.current_building_index]['inputs'] = results['inputs']
            
            # Save to history
            save_to_history(results)
            
            # Display results
            st.success("✅ Calculation completed successfully!")
            
        except Exception as e:
            st.error(f"❌ Calculation error: {str(e)}")
            return
    
    # Display results if available
    if (st.session_state.buildings and 
        st.session_state.current_building_index < len(st.session_state.buildings) and
        st.session_state.buildings[st.session_state.current_building_index].get('results')):
        
        results = st.session_state.buildings[st.session_state.current_building_index]['results']
        
        st.header("📋 Calculation Results")
        
        # Main results
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric(
                label="👥 Occupant Load",
                value=f"{results['occupant_load']} occupants"
            )
        
        with col2:
            st.metric(
                label="🚪 Stair Width",
                value=format_width(results['egress_widths']['stairs'], st.session_state.current_units)
            )
        
        with col3:
            st.metric(
                label="🔄 Other Components Width",
                value=format_width(results['egress_widths']['other'], st.session_state.current_units)
            )
        
        # Advanced results
        if results.get('door_width'):
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric(
                    label="🚪 Min Door Width (per door)",
                    value=format_width(results['door_width'], st.session_state.current_units)
                )
            
            with col2:
                st.metric(
                    label="📏 Total Required Exit Width",
                    value=format_width(results['total_width'], st.session_state.current_units)
                )
        
        # Step-by-step calculation breakdown
        with st.expander("🔍 Step-by-Step Calculation Process", expanded=False):
            steps = generate_step_by_step_calculation(results['inputs'], results)
            
            for step in steps:
                st.markdown(f"### Step {step['step']}: {step['title']}")
                
                # Create columns for better layout
                step_col1, step_col2 = st.columns([3, 2])
                
                with step_col1:
                    st.markdown(f"**Description:** {step['description']}")
                    st.markdown(f"**Calculation:** {step['calculation']}")
                    if step.get('formula'):
                        st.code(step['formula'], language='text')
                
                with step_col2:
                    st.markdown(f"**Result:** {step['result']}")
                    if step.get('note'):
                        st.info(f"💡 {step['note']}")
                
                if step['step'] < len(steps):
                    st.divider()
        
        # Compliance warnings and recommendations
        with st.expander("⚠️ Design Considerations & Recommendations", expanded=False):
            st.warning("""
            **Professional Review Required:** This calculator provides preliminary calculations based on IBC requirements. 
            Always consult with licensed professionals and local authorities for final design approval.
            """)
            
            recommendations = []
            
            # Check for common issues
            if results['occupant_load'] > 300:
                recommendations.append("• High occupant load buildings may require additional exits and special egress considerations")
            
            if not results['inputs']['has_sprinklers']:
                recommendations.append("• Consider automatic sprinkler system installation to reduce egress width requirements")
            
            travel_distance = results['inputs'].get('travel_distance')
            if travel_distance and travel_distance > 200:
                recommendations.append("• Long travel distances may require additional exits or egress modifications")
            
            if results['egress_widths']['stairs'] > 72:
                recommendations.append("• Wide egress requirements may necessitate multiple stair systems")
            
            if results['inputs']['occupancy'] in ['A-1', 'A-2', 'A-3']:
                recommendations.append("• Assembly occupancies have special egress requirements - verify with local code officials")
            
            if recommendations:
                st.markdown("**Design Considerations:**")
                for rec in recommendations:
                    st.markdown(rec)
        
        # Code references
        st.subheader("📖 Relevant IBC Sections")
        
        refs_col1, refs_col2 = st.columns(2)
        
        with refs_col1:
            st.markdown(f"**[{CODE_REFERENCES['occupant_load']['section']}]({CODE_REFERENCES['occupant_load']['link']})** - {CODE_REFERENCES['occupant_load']['description']}")
            st.markdown(f"**[{CODE_REFERENCES['egress_width']['section']}]({CODE_REFERENCES['egress_width']['link']})** - {CODE_REFERENCES['egress_width']['description']}")
        
        with refs_col2:
            if results.get('door_width'):
                st.markdown(f"**[{CODE_REFERENCES['exit_access']['section']}]({CODE_REFERENCES['exit_access']['link']})** - {CODE_REFERENCES['exit_access']['description']}")
                st.markdown(f"**[{CODE_REFERENCES['door_width']['section']}]({CODE_REFERENCES['door_width']['link']})** - {CODE_REFERENCES['door_width']['description']}")
        
        # Jurisdiction notice
        st.info(generate_code_notice(results['inputs']['state']))
        
        # Calculation summary
        with st.expander("📊 Detailed Calculation Summary (Copy/Export)", expanded=False):
            summary = generate_calculation_summary(results['inputs'], results)
            st.text_area(
                "Complete Calculation Summary:",
                value=summary,
                height=500,
                help="Copy this summary for your records, reports, or permit applications"
            )
            
            # Download summary
            st.download_button(
                label="📥 Download Summary as Text File",
                data=summary,
                file_name=f"egress_summary_{st.session_state.project_name or 'project'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                mime="text/plain"
            )
    
    # History section
    if st.session_state.show_history and st.session_state.calculation_history:
        st.header("📈 Calculation History")
        
        col1, col2 = st.columns([3, 1])
        with col2:
            if st.button("🗑️ Clear History"):
                st.session_state.calculation_history = []
                st.rerun()
        
        # Display history
        for i, item in enumerate(st.session_state.calculation_history[:10]):  # Show last 10
            with st.expander(f"{item['project_name']} - Building {item['building_index']} ({datetime.fromisoformat(item['date']).strftime('%Y-%m-%d %H:%M')})"):
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.write(f"**Occupancy:** {item['inputs']['occupancy']}")
                    st.write(f"**Area:** {item['inputs']['floor_area']:,} {item['units']}")
                
                with col2:
                    st.write(f"**Occupant Load:** {item['results']['occupant_load']} people")
                    st.write(f"**Sprinklers:** {'Yes' if item['inputs']['has_sprinklers'] else 'No'}")
                
                with col3:
                    st.write(f"**Stair Width:** {format_width(item['results']['stair_width'], item['units'])}")
                    st.write(f"**Other Width:** {format_width(item['results']['other_width'], item['units'])}")
    
    # Footer
    st.divider()
    footer_col1, footer_col2 = st.columns([2, 1])
    
    with footer_col1:
        st.markdown("""
        **⚠️ Disclaimer:** This calculator is for preliminary design purposes only. 
        Always consult with local authorities and verify current code requirements before finalizing any design.
        """)
    
    with footer_col2:
        st.markdown(f"""
        **Egress Calculator v{__version__}**  
        Built: {__build_date__}  
        [📚 GitHub Repository](https://github.com/hanialnaber/egress-calculator)
        """)
        
        if st.button("📋 View Changelog"):
            st.session_state.show_changelog = not st.session_state.get('show_changelog', False)
    
    # Changelog modal
    if st.session_state.get('show_changelog', False):
        with st.expander("📋 Full Changelog", expanded=True):
            for version, changes in __changelog__.items():
                st.markdown(f"### Version {version}")
                for change in changes:
                    st.markdown(f"• {change}")
                st.markdown("---")

if __name__ == "__main__":
    main()
