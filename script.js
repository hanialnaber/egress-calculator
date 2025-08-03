/**
 * Egress & Occupant Load Calculator - Enhanced Version
 * Professional IBC-based calculations for architectural design
 * Features: Multi-building support, unit conversion, project save/load, calculation history
 */

// IBC Occupant Load Factors (sq. ft. per occupant)
const IBC_DATA = {
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
};

// Egress capacity factors (inches per occupant)
const EGRESS_FACTORS = {
    withSprinklers: {
        stairs: 0.2,
        other: 0.15
    },
    withoutSprinklers: {
        stairs: 0.3,
        other: 0.2
    }
};

// Area type mapping (gross vs net area)
const AREA_TYPES = {
    "Assembly (Less Concentrated)": "Net",
    "Assembly (Standing Space)": "Net",
    "Business": "Gross",
    "Educational": "Net",
    "Mercantile": "Gross",
    "Residential": "Gross"
};

// IBC Code References
const CODE_REFERENCES = {
    occupantLoad: {
        section: "IBC 1004",
        description: "Occupant Load",
        link: "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1004"
    },
    egressWidth: {
        section: "IBC 1005",
        description: "Egress Width",
        link: "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1005"
    },
    exitAccess: {
        section: "IBC 1017",
        description: "Exit Access Travel Distance",
        link: "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1017"
    },
    doorWidth: {
        section: "IBC 1010.1.1",
        description: "Door Width",
        link: "https://codes.iccsafe.org/content/IBC2021P1/chapter-10-means-of-egress#IBC2021P1_Ch10_Sec1010.1.1"
    }
};

// Application State
const appState = {
    currentUnits: 'imperial', // 'imperial' or 'metric'
    buildings: [],
    currentBuildingIndex: 0,
    projectName: '',
    calculationHistory: [],
    showAdvanced: false
};

// Unit Conversion Factors
const UNIT_CONVERSION = {
    area: {
        toMetric: 0.092903, // sq ft to sq m
        toImperial: 10.7639 // sq m to sq ft
    },
    length: {
        toMetric: 0.3048, // ft to m
        toImperial: 3.28084 // m to ft
    },
    width: {
        toMetric: 25.4, // inches to mm
        toImperial: 0.0393701 // mm to inches
    }
};

// DOM Elements
const elements = {
    // Existing elements
    state: document.getElementById('state'),
    ibcVersion: document.getElementById('ibcVersion'),
    occupancy: document.getElementById('occupancy'),
    floorArea: document.getElementById('floorArea'),
    sprinkler: document.getElementById('sprinkler'),
    calculateBtn: document.getElementById('calculateBtn'),
    resultsSection: document.getElementById('resultsSection'),
    occupantLoad: document.getElementById('occupantLoad'),
    stairWidth: document.getElementById('stairWidth'),
    otherWidth: document.getElementById('otherWidth'),
    codeNotice: document.getElementById('codeNotice'),
    areaType: document.getElementById('areaType'),
    
    // New enhanced elements
    projectName: document.getElementById('projectName'),
    currentBuilding: document.getElementById('currentBuilding'),
    totalBuildings: document.getElementById('totalBuildings'),
    travelDistance: document.getElementById('travelDistance'),
    exitDoors: document.getElementById('exitDoors'),
    doorWidth: document.getElementById('doorWidth'),
    totalWidth: document.getElementById('totalWidth'),
    doorWidthResult: document.getElementById('doorWidthResult'),
    totalWidthResult: document.getElementById('totalWidthResult'),
    codeReferences: document.getElementById('codeReferences'),
    calcSummary: document.getElementById('calcSummary'),
    areaUnits: document.getElementById('areaUnits'),
    distanceUnits: document.getElementById('distanceUnits'),
    currentUnits: document.getElementById('currentUnits'),
    areaHelp: document.getElementById('areaHelp'),
    
    // Header buttons
    newProjectBtn: document.getElementById('newProjectBtn'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    loadProjectBtn: document.getElementById('loadProjectBtn'),
    unitsToggle: document.getElementById('unitsToggle'),
    historyBtn: document.getElementById('historyBtn'),
    
    // Action buttons
    printBtn: document.getElementById('printBtn'),
    exportBtn: document.getElementById('exportBtn'),
    copyBtn: document.getElementById('copyBtn'),
    addBuildingBtn: document.getElementById('addBuildingBtn'),
    advancedToggle: document.getElementById('advancedToggle'),
    
    // Modals
    historyModal: document.getElementById('historyModal'),
    loadModal: document.getElementById('loadModal'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    closeLoadBtn: document.getElementById('closeLoadBtn'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    savedProjects: document.getElementById('savedProjects'),
    fileInput: document.getElementById('fileInput')
};

/**
 * Initialize the application
 */
function init() {
    // Load saved data
    loadAppState();
    
    // Add event listeners
    setupEventListeners();
    
    // Initialize first building
    if (appState.buildings.length === 0) {
        addNewBuilding();
    }
    
    // Initial setup
    updateAreaType();
    updateUnitLabels();
    updateBuildingCounter();
    loadSavedProjects();
    loadCalculationHistory();
    
    console.log('Enhanced Egress Calculator initialized successfully');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Existing listeners
    elements.calculateBtn.addEventListener('click', calculateEgress);
    elements.occupancy.addEventListener('change', updateAreaType);
    
    // New enhanced listeners
    elements.newProjectBtn.addEventListener('click', newProject);
    elements.saveProjectBtn.addEventListener('click', saveProject);
    elements.loadProjectBtn.addEventListener('click', showLoadModal);
    elements.unitsToggle.addEventListener('click', toggleUnits);
    elements.historyBtn.addEventListener('click', showHistoryModal);
    
    elements.printBtn.addEventListener('click', printResults);
    elements.exportBtn.addEventListener('click', exportResults);
    elements.copyBtn.addEventListener('click', copyResults);
    elements.addBuildingBtn.addEventListener('click', addNewBuilding);
    elements.advancedToggle.addEventListener('click', toggleAdvancedOptions);
    
    // Modal listeners
    elements.closeHistoryBtn.addEventListener('click', hideHistoryModal);
    elements.closeLoadBtn.addEventListener('click', hideLoadModal);
    elements.clearHistoryBtn.addEventListener('click', clearCalculationHistory);
    elements.fileInput.addEventListener('change', loadProjectFromFile);
    
    // Real-time validation
    elements.floorArea.addEventListener('input', updateAreaHelp);
    elements.travelDistance.addEventListener('input', updateAreaHelp);
    
    // Project name auto-save
    elements.projectName.addEventListener('input', () => {
        appState.projectName = elements.projectName.value;
        saveAppState();
    });
}

/**
 * Update the area type indicator based on selected occupancy
 */
function updateAreaType() {
    const selectedOccupancy = elements.occupancy.value;
    
    if (selectedOccupancy && AREA_TYPES[selectedOccupancy]) {
        const areaType = AREA_TYPES[selectedOccupancy];
        elements.areaType.textContent = `(${areaType})`;
        elements.areaType.style.display = 'inline';
    } else {
        elements.areaType.textContent = '';
        elements.areaType.style.display = 'none';
    }
}

/**
 * Validate all required inputs
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateInputs() {
    const state = elements.state.value;
    const ibcVersion = elements.ibcVersion.value;
    const occupancy = elements.occupancy.value;
    const floorArea = parseFloat(elements.floorArea.value);
    const sprinkler = elements.sprinkler.value;

    if (!state) {
        return { isValid: false, message: 'Please select a state/jurisdiction.' };
    }

    if (!ibcVersion) {
        return { isValid: false, message: 'Please select an IBC code version.' };
    }

    if (!occupancy) {
        return { isValid: false, message: 'Please select an occupancy classification.' };
    }

    if (!floorArea || floorArea <= 0) {
        return { isValid: false, message: 'Please enter a valid floor area greater than 0.' };
    }

    if (!sprinkler) {
        return { isValid: false, message: 'Please specify if the building has an automatic sprinkler system.' };
    }

    // Check if the selected combination exists in our data
    if (!IBC_DATA[ibcVersion] || !IBC_DATA[ibcVersion][occupancy]) {
        return { 
            isValid: false, 
            message: 'Invalid combination of IBC version and occupancy classification.' 
        };
    }

    return { isValid: true };
}

/**
 * Calculate occupant load
 * @param {number} area - Floor area in square feet
 * @param {number} factor - Occupant load factor (sq ft per occupant)
 * @returns {number} Calculated occupant load
 */
function calculateOccupantLoad(area, factor) {
    return Math.ceil(area / factor);
}

/**
 * Calculate egress width requirements
 * @param {number} occupantLoad - Number of occupants
 * @param {boolean} hasSprinklers - Whether building has sprinkler system
 * @returns {Object} Egress width requirements for stairs and other components
 */
function calculateEgressWidths(occupantLoad, hasSprinklers) {
    const factors = hasSprinklers ? EGRESS_FACTORS.withSprinklers : EGRESS_FACTORS.withoutSprinklers;
    
    return {
        stairs: Math.ceil(occupantLoad * factors.stairs),
        other: Math.ceil(occupantLoad * factors.other)
    };
}

/**
 * Calculate minimum door width based on occupant load and number of exits
 * @param {number} occupantLoad - Number of occupants
 * @param {number} numberOfExits - Number of exit doors
 * @param {boolean} hasSprinklers - Whether building has sprinkler system
 * @returns {number} Minimum door width in inches
 */
function calculateDoorWidth(occupantLoad, numberOfExits, hasSprinklers) {
    const totalRequiredWidth = calculateEgressWidths(occupantLoad, hasSprinklers).other;
    const widthPerDoor = Math.ceil(totalRequiredWidth / numberOfExits);
    
    // IBC minimum door width is 32 inches (but 36 inches is more practical)
    const minimumDoorWidth = 32;
    
    return Math.max(widthPerDoor, minimumDoorWidth);
}

/**
 * Calculate total required exit width
 * @param {number} occupantLoad - Number of occupants
 * @param {boolean} hasSprinklers - Whether building has sprinkler system
 * @returns {number} Total required exit width
 */
function calculateTotalExitWidth(occupantLoad, hasSprinklers) {
    return calculateEgressWidths(occupantLoad, hasSprinklers).other;
}

/**
 * Convert value between imperial and metric units
 * @param {number} value - Value to convert
 * @param {string} type - Type of conversion (area, length, width)
 * @param {string} direction - 'toMetric' or 'toImperial'
 * @returns {number} Converted value
 */
function convertUnits(value, type, direction) {
    if (!value || !UNIT_CONVERSION[type] || !UNIT_CONVERSION[type][direction]) {
        return value;
    }
    
    return value * UNIT_CONVERSION[type][direction];
}

/**
 * Get current area factor adjusted for units
 * @param {string} ibcVersion - IBC version
 * @param {string} occupancy - Occupancy type
 * @returns {number} Area factor adjusted for current units
 */
function getAreaFactor(ibcVersion, occupancy) {
    let factor = IBC_DATA[ibcVersion][occupancy];
    
    if (appState.currentUnits === 'metric') {
        // Convert from sq ft per occupant to sq m per occupant
        factor = factor * UNIT_CONVERSION.area.toMetric;
    }
    
    return factor;
}

/**
 * Format area value for display
 * @param {number} value - Area value
 * @returns {string} Formatted area with units
 */
function formatArea(value) {
    const units = appState.currentUnits === 'metric' ? 'sq. m' : 'sq. ft.';
    return `${value.toLocaleString()} ${units}`;
}

/**
 * Format width value for display
 * @param {number} value - Width value in inches (imperial) or mm (metric)
 * @returns {string} Formatted width with units
 */
function formatWidth(value) {
    if (appState.currentUnits === 'metric') {
        const mmValue = Math.round(value * UNIT_CONVERSION.width.toMetric);
        return `${mmValue} mm`;
    } else {
        return `${value} inches`;
    }
}

/**
 * Format length value for display
 * @param {number} value - Length value in feet (imperial) or meters (metric)
 * @returns {string} Formatted length with units
 */
function formatLength(value) {
    if (appState.currentUnits === 'metric') {
        const mValue = (value * UNIT_CONVERSION.length.toMetric).toFixed(1);
        return `${mValue} m`;
    } else {
        return `${value} ft`;
    }
}

/**
 * Generate jurisdiction-specific notice
 * @param {string} state - Selected state
 * @returns {string} Notice message
 */
function generateCodeNotice(state) {
    if (state === 'Texas') {
        return `<strong>Texas Jurisdiction Notice:</strong> Texas adopts the IBC statewide, but local jurisdictions like Houston, Dallas, and Austin have their own amendments and may use different code versions. <strong>Always verify with the local authority having jurisdiction.</strong>`;
    } else {
        return `<strong>Code Compliance Notice:</strong> This calculation is based on the standard IBC. <strong>Always verify local and state-specific amendments</strong> before finalizing any design.`;
    }
}

/**
 * Generate code references HTML
 * @param {string} occupancy - Occupancy type
 * @param {boolean} hasAdvanced - Whether advanced options are used
 * @returns {string} Code references HTML
 */
function generateCodeReferences(occupancy, hasAdvanced) {
    let html = '';
    
    // Always include basic references
    html += `<div class="code-ref-item">
        <a href="${CODE_REFERENCES.occupantLoad.link}" target="_blank" class="code-ref-link">
            ${CODE_REFERENCES.occupantLoad.section}
        </a> - ${CODE_REFERENCES.occupantLoad.description}
    </div>`;
    
    html += `<div class="code-ref-item">
        <a href="${CODE_REFERENCES.egressWidth.link}" target="_blank" class="code-ref-link">
            ${CODE_REFERENCES.egressWidth.section}
        </a> - ${CODE_REFERENCES.egressWidth.description}
    </div>`;
    
    if (hasAdvanced) {
        html += `<div class="code-ref-item">
            <a href="${CODE_REFERENCES.exitAccess.link}" target="_blank" class="code-ref-link">
                ${CODE_REFERENCES.exitAccess.section}
            </a> - ${CODE_REFERENCES.exitAccess.description}
        </div>`;
        
        html += `<div class="code-ref-item">
            <a href="${CODE_REFERENCES.doorWidth.link}" target="_blank" class="code-ref-link">
                ${CODE_REFERENCES.doorWidth.section}
            </a> - ${CODE_REFERENCES.doorWidth.description}
        </div>`;
    }
    
    return html;
}

/**
 * Generate calculation summary
 * @param {Object} inputs - Input parameters
 * @param {Object} results - Calculation results
 * @returns {string} Calculation summary HTML
 */
function generateCalculationSummary(inputs, results) {
    const areaUnits = appState.currentUnits === 'metric' ? 'sq. m' : 'sq. ft.';
    const widthUnits = appState.currentUnits === 'metric' ? 'mm' : 'inches';
    
    let summary = `Project: ${appState.projectName || 'Untitled Project'}\n`;
    summary += `Building: ${appState.currentBuildingIndex + 1} of ${appState.buildings.length}\n`;
    summary += `Date: ${new Date().toLocaleString()}\n\n`;
    
    summary += `INPUT PARAMETERS:\n`;
    summary += `• State/Jurisdiction: ${inputs.state}\n`;
    summary += `• IBC Code Version: ${inputs.ibcVersion}\n`;
    summary += `• Occupancy Classification: ${inputs.occupancy}\n`;
    summary += `• Floor Area: ${inputs.floorArea.toLocaleString()} ${areaUnits}\n`;
    summary += `• Occupant Load Factor: ${inputs.occupantLoadFactor} ${areaUnits}/occupant\n`;
    summary += `• Automatic Sprinkler System: ${inputs.hasSprinklers ? 'Yes' : 'No'}\n`;
    
    if (inputs.travelDistance) {
        const distanceUnits = appState.currentUnits === 'metric' ? 'm' : 'ft';
        summary += `• Max Travel Distance: ${inputs.travelDistance} ${distanceUnits}\n`;
    }
    
    if (inputs.exitDoors) {
        summary += `• Number of Exit Doors: ${inputs.exitDoors}\n`;
    }
    
    summary += `\nCALCULATION PROCESS:\n`;
    summary += `1. Occupant Load = ceil(${inputs.floorArea} ÷ ${inputs.occupantLoadFactor}) = ${results.occupantLoad} occupants\n`;
    
    const stairFactor = inputs.hasSprinklers ? EGRESS_FACTORS.withSprinklers.stairs : EGRESS_FACTORS.withoutSprinklers.stairs;
    const otherFactor = inputs.hasSprinklers ? EGRESS_FACTORS.withSprinklers.other : EGRESS_FACTORS.withoutSprinklers.other;
    
    summary += `2. Stair Width = ${results.occupantLoad} × ${stairFactor} = ${results.egressWidths.stairs} ${widthUnits}\n`;
    summary += `3. Other Components Width = ${results.occupantLoad} × ${otherFactor} = ${results.egressWidths.other} ${widthUnits}\n`;
    
    if (results.doorWidth) {
        summary += `4. Door Width (per door) = ${results.totalWidth} ÷ ${inputs.exitDoors} = ${results.doorWidth} ${widthUnits}\n`;
    }
    
    summary += `\nRESULTS:\n`;
    summary += `• Occupant Load: ${results.occupantLoad} occupants\n`;
    summary += `• Required Stair Width: ${results.egressWidths.stairs} ${widthUnits}\n`;
    summary += `• Required Other Components Width: ${results.egressWidths.other} ${widthUnits}\n`;
    
    if (results.doorWidth) {
        summary += `• Minimum Door Width: ${results.doorWidth} ${widthUnits}\n`;
        summary += `• Total Required Exit Width: ${results.totalWidth} ${widthUnits}\n`;
    }
    
    return summary;
}

/**
 * Display results in the results section
 * @param {Object} results - Calculation results
 */
function displayResults(results) {
    // Update result values with proper formatting
    elements.occupantLoad.textContent = `${results.occupantLoad} occupants`;
    elements.stairWidth.textContent = formatWidth(results.egressWidths.stairs);
    elements.otherWidth.textContent = formatWidth(results.egressWidths.other);
    
    // Show/hide advanced results
    if (results.doorWidth) {
        elements.doorWidth.textContent = formatWidth(results.doorWidth);
        elements.totalWidth.textContent = formatWidth(results.totalWidth);
        elements.doorWidthResult.style.display = 'flex';
        elements.totalWidthResult.style.display = 'flex';
    } else {
        elements.doorWidthResult.style.display = 'none';
        elements.totalWidthResult.style.display = 'none';
    }
    
    // Update code references
    elements.codeReferences.innerHTML = generateCodeReferences(
        results.inputs.occupancy, 
        results.doorWidth !== undefined
    );
    
    // Update code notice
    elements.codeNotice.innerHTML = results.notice;
    
    // Update calculation summary
    elements.calcSummary.textContent = generateCalculationSummary(results.inputs, results);
    
    // Show results section with animation
    elements.resultsSection.classList.remove('hidden');
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    // Save to history
    saveCalculationToHistory(results);
}

// ===== PROJECT MANAGEMENT FUNCTIONS =====

/**
 * Create a new project
 */
function newProject() {
    if (confirm('Start a new project? This will clear all current data.')) {
        appState.projectName = '';
        appState.buildings = [];
        appState.currentBuildingIndex = 0;
        
        elements.projectName.value = '';
        elements.resultsSection.classList.add('hidden');
        
        addNewBuilding();
        clearFormInputs();
        updateBuildingCounter();
        saveAppState();
    }
}

/**
 * Add a new building to the project
 */
function addNewBuilding() {
    const newBuilding = {
        id: Date.now(),
        name: `Building ${appState.buildings.length + 1}`,
        inputs: {},
        results: null
    };
    
    appState.buildings.push(newBuilding);
    appState.currentBuildingIndex = appState.buildings.length - 1;
    
    updateBuildingCounter();
    clearFormInputs();
    saveAppState();
}

/**
 * Save current project to localStorage
 */
function saveProject() {
    if (!appState.projectName) {
        const name = prompt('Enter a name for this project:');
        if (!name) return;
        appState.projectName = name;
        elements.projectName.value = name;
    }
    
    // Save current building data
    saveCurrentBuildingData();
    
    const projectData = {
        name: appState.projectName,
        buildings: appState.buildings,
        createdDate: new Date().toISOString(),
        version: '2.0'
    };
    
    const savedProjects = JSON.parse(localStorage.getItem('egressProjects') || '[]');
    
    // Check if project already exists
    const existingIndex = savedProjects.findIndex(p => p.name === appState.projectName);
    
    if (existingIndex >= 0) {
        if (confirm('Project with this name already exists. Overwrite?')) {
            savedProjects[existingIndex] = projectData;
        } else {
            return;
        }
    } else {
        savedProjects.push(projectData);
    }
    
    localStorage.setItem('egressProjects', JSON.stringify(savedProjects));
    
    alert(`Project "${appState.projectName}" saved successfully!`);
    loadSavedProjects();
}

/**
 * Load saved projects list
 */
function loadSavedProjects() {
    const savedProjects = JSON.parse(localStorage.getItem('egressProjects') || '[]');
    
    if (savedProjects.length === 0) {
        elements.savedProjects.innerHTML = '<p>No saved projects found.</p>';
        return;
    }
    
    elements.savedProjects.innerHTML = savedProjects.map(project => `
        <div class="saved-project-item" onclick="loadProject('${project.name}')">
            <div>
                <strong>${project.name}</strong><br>
                <small>Created: ${new Date(project.createdDate).toLocaleDateString()}</small><br>
                <small>${project.buildings.length} building(s)</small>
            </div>
            <button class="project-delete-btn" onclick="event.stopPropagation(); deleteProject('${project.name}')">Delete</button>
        </div>
    `).join('');
}

/**
 * Load a specific project
 * @param {string} projectName - Name of project to load
 */
function loadProject(projectName) {
    const savedProjects = JSON.parse(localStorage.getItem('egressProjects') || '[]');
    const project = savedProjects.find(p => p.name === projectName);
    
    if (!project) {
        alert('Project not found!');
        return;
    }
    
    appState.projectName = project.name;
    appState.buildings = project.buildings;
    appState.currentBuildingIndex = 0;
    
    elements.projectName.value = project.name;
    
    // Load first building data
    loadBuildingData(0);
    updateBuildingCounter();
    hideLoadModal();
    
    alert(`Project "${projectName}" loaded successfully!`);
    saveAppState();
}

/**
 * Delete a saved project
 * @param {string} projectName - Name of project to delete
 */
function deleteProject(projectName) {
    if (!confirm(`Delete project "${projectName}"? This cannot be undone.`)) {
        return;
    }
    
    const savedProjects = JSON.parse(localStorage.getItem('egressProjects') || '[]');
    const filteredProjects = savedProjects.filter(p => p.name !== projectName);
    
    localStorage.setItem('egressProjects', JSON.stringify(filteredProjects));
    loadSavedProjects();
}

// ===== UNIT CONVERSION FUNCTIONS =====

/**
 * Toggle between imperial and metric units
 */
function toggleUnits() {
    appState.currentUnits = appState.currentUnits === 'imperial' ? 'metric' : 'imperial';
    
    // Convert current input values
    convertFormValues();
    
    // Update labels
    updateUnitLabels();
    
    // Save state
    saveAppState();
    
    // Recalculate if results are shown
    if (!elements.resultsSection.classList.contains('hidden')) {
        calculateEgress();
    }
}

/**
 * Convert form values when switching units
 */
function convertFormValues() {
    // Convert area
    const currentArea = parseFloat(elements.floorArea.value);
    if (currentArea) {
        const direction = appState.currentUnits === 'metric' ? 'toMetric' : 'toImperial';
        const convertedArea = convertUnits(currentArea, 'area', direction);
        elements.floorArea.value = convertedArea.toFixed(2);
    }
    
    // Convert travel distance
    const currentDistance = parseFloat(elements.travelDistance.value);
    if (currentDistance) {
        const direction = appState.currentUnits === 'metric' ? 'toMetric' : 'toImperial';
        const convertedDistance = convertUnits(currentDistance, 'length', direction);
        elements.travelDistance.value = convertedDistance.toFixed(1);
    }
}

/**
 * Update unit labels throughout the interface
 */
function updateUnitLabels() {
    if (appState.currentUnits === 'metric') {
        elements.currentUnits.textContent = 'Metric';
        elements.areaUnits.textContent = 'sq. m';
        elements.distanceUnits.textContent = 'm';
    } else {
        elements.currentUnits.textContent = 'Imperial';
        elements.areaUnits.textContent = 'sq. ft.';
        elements.distanceUnits.textContent = 'ft';
    }
}

// ===== BUILDING MANAGEMENT FUNCTIONS =====

/**
 * Update building counter display
 */
function updateBuildingCounter() {
    elements.currentBuilding.textContent = appState.currentBuildingIndex + 1;
    elements.totalBuildings.textContent = appState.buildings.length;
}

/**
 * Save current building input data
 */
function saveCurrentBuildingData() {
    if (appState.buildings.length === 0) return;
    
    const currentBuilding = appState.buildings[appState.currentBuildingIndex];
    currentBuilding.inputs = {
        state: elements.state.value,
        ibcVersion: elements.ibcVersion.value,
        occupancy: elements.occupancy.value,
        floorArea: elements.floorArea.value,
        sprinkler: elements.sprinkler.value,
        travelDistance: elements.travelDistance.value,
        exitDoors: elements.exitDoors.value
    };
}

/**
 * Load building data into form
 * @param {number} buildingIndex - Index of building to load
 */
function loadBuildingData(buildingIndex) {
    if (buildingIndex < 0 || buildingIndex >= appState.buildings.length) return;
    
    const building = appState.buildings[buildingIndex];
    
    if (building.inputs) {
        elements.state.value = building.inputs.state || '';
        elements.ibcVersion.value = building.inputs.ibcVersion || '';
        elements.occupancy.value = building.inputs.occupancy || '';
        elements.floorArea.value = building.inputs.floorArea || '';
        elements.sprinkler.value = building.inputs.sprinkler || '';
        elements.travelDistance.value = building.inputs.travelDistance || '';
        elements.exitDoors.value = building.inputs.exitDoors || 2;
        
        updateAreaType();
        updateAreaHelp();
    }
}

/**
 * Clear all form inputs
 */
function clearFormInputs() {
    elements.state.value = '';
    elements.ibcVersion.value = '';
    elements.occupancy.value = '';
    elements.floorArea.value = '';
    elements.sprinkler.value = '';
    elements.travelDistance.value = '';
    elements.exitDoors.value = 2;
    
    elements.resultsSection.classList.add('hidden');
    updateAreaType();
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    alert(`Error: ${message}`);
}

/**
 * Main calculation function
 */
function calculateEgress() {
    try {
        // Hide results section initially
        elements.resultsSection.classList.add('hidden');
        
        // Validate inputs
        const validation = validateInputs();
        if (!validation.isValid) {
            showError(validation.message);
            return;
        }

        // Get input values
        const state = elements.state.value;
        const ibcVersion = elements.ibcVersion.value;
        const occupancy = elements.occupancy.value;
        const floorArea = parseFloat(elements.floorArea.value);
        const hasSprinklers = elements.sprinkler.value === 'yes';
        const travelDistance = parseFloat(elements.travelDistance.value) || null;
        const exitDoors = parseInt(elements.exitDoors.value) || 2;

        // Get occupant load factor (adjusted for units)
        const occupantLoadFactor = getAreaFactor(ibcVersion, occupancy);

        // Perform calculations
        const occupantLoad = calculateOccupantLoad(floorArea, occupantLoadFactor);
        const egressWidths = calculateEgressWidths(occupantLoad, hasSprinklers);
        const notice = generateCodeNotice(state);

        // Advanced calculations (if enabled)
        let doorWidth = null;
        let totalWidth = null;
        
        if (appState.showAdvanced && exitDoors > 0) {
            doorWidth = calculateDoorWidth(occupantLoad, exitDoors, hasSprinklers);
            totalWidth = calculateTotalExitWidth(occupantLoad, hasSprinklers);
        }

        // Prepare results object
        const results = {
            occupantLoad,
            egressWidths,
            doorWidth,
            totalWidth,
            notice,
            inputs: {
                state,
                ibcVersion,
                occupancy,
                floorArea,
                hasSprinklers,
                occupantLoadFactor,
                travelDistance,
                exitDoors
            }
        };

        // Display results
        displayResults(results);

        // Save current building data
        saveCurrentBuildingData();
        
        // Save building results
        if (appState.buildings.length > 0) {
            appState.buildings[appState.currentBuildingIndex].results = results;
        }

        // Save app state
        saveAppState();

        // Log calculation details for debugging
        console.log('Enhanced calculation completed:', {
            floorArea,
            occupantLoadFactor,
            occupantLoad,
            hasSprinklers,
            egressWidths,
            doorWidth,
            totalWidth,
            units: appState.currentUnits
        });

    } catch (error) {
        console.error('Calculation error:', error);
        showError('An unexpected error occurred during calculation. Please check your inputs and try again.');
    }
}

// ===== CALCULATION HISTORY FUNCTIONS =====

/**
 * Save calculation to history
 * @param {Object} results - Calculation results
 */
function saveCalculationToHistory(results) {
    const historyItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        projectName: appState.projectName || 'Untitled Project',
        buildingIndex: appState.currentBuildingIndex + 1,
        inputs: results.inputs,
        results: {
            occupantLoad: results.occupantLoad,
            stairWidth: results.egressWidths.stairs,
            otherWidth: results.egressWidths.other,
            doorWidth: results.doorWidth,
            totalWidth: results.totalWidth
        },
        units: appState.currentUnits
    };
    
    // Add to beginning of history
    appState.calculationHistory.unshift(historyItem);
    
    // Limit history to 50 items
    if (appState.calculationHistory.length > 50) {
        appState.calculationHistory = appState.calculationHistory.slice(0, 50);
    }
    
    saveAppState();
}

/**
 * Load calculation history from localStorage
 */
function loadCalculationHistory() {
    const saved = localStorage.getItem('egressCalculationHistory');
    if (saved) {
        appState.calculationHistory = JSON.parse(saved);
    }
}

/**
 * Display calculation history
 */
function displayCalculationHistory() {
    if (appState.calculationHistory.length === 0) {
        elements.historyList.innerHTML = '<p>No calculations found in history.</p>';
        return;
    }
    
    elements.historyList.innerHTML = appState.calculationHistory.map(item => {
        const date = new Date(item.date).toLocaleString();
        const units = item.units === 'metric' ? 'metric' : 'imperial';
        
        return `
            <div class="history-item" onclick="loadHistoryItem('${item.id}')">
                <div class="history-date">${date} (${units})</div>
                <div class="history-summary">
                    <strong>${item.projectName}</strong> - Building ${item.buildingIndex}<br>
                    ${item.inputs.occupancy} | ${item.results.occupantLoad} occupants | 
                    ${item.inputs.floorArea} ${units === 'metric' ? 'sq.m' : 'sq.ft'}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Load a calculation from history
 * @param {string} itemId - History item ID
 */
function loadHistoryItem(itemId) {
    const item = appState.calculationHistory.find(h => h.id == itemId);
    if (!item) return;
    
    // Load inputs
    elements.state.value = item.inputs.state;
    elements.ibcVersion.value = item.inputs.ibcVersion;
    elements.occupancy.value = item.inputs.occupancy;
    elements.floorArea.value = item.inputs.floorArea;
    elements.sprinkler.value = item.inputs.hasSprinklers ? 'yes' : 'no';
    elements.travelDistance.value = item.inputs.travelDistance || '';
    elements.exitDoors.value = item.inputs.exitDoors || 2;
    
    // Switch units if needed
    if (item.units !== appState.currentUnits) {
        appState.currentUnits = item.units;
        updateUnitLabels();
        saveAppState();
    }
    
    updateAreaType();
    hideHistoryModal();
    
    // Recalculate
    setTimeout(() => calculateEgress(), 100);
}

/**
 * Clear calculation history
 */
function clearCalculationHistory() {
    if (confirm('Clear all calculation history? This cannot be undone.')) {
        appState.calculationHistory = [];
        saveAppState();
        displayCalculationHistory();
    }
}

// ===== MODAL MANAGEMENT FUNCTIONS =====

/**
 * Show history modal
 */
function showHistoryModal() {
    displayCalculationHistory();
    elements.historyModal.classList.remove('hidden');
}

/**
 * Hide history modal
 */
function hideHistoryModal() {
    elements.historyModal.classList.add('hidden');
}

/**
 * Show load project modal
 */
function showLoadModal() {
    loadSavedProjects();
    elements.loadModal.classList.remove('hidden');
}

/**
 * Hide load project modal
 */
function hideLoadModal() {
    elements.loadModal.classList.add('hidden');
}

/**
 * Load project from uploaded file
 * @param {Event} event - File input change event
 */
function loadProjectFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const projectData = JSON.parse(e.target.result);
            
            if (!projectData.name || !projectData.buildings) {
                throw new Error('Invalid project file format');
            }
            
            appState.projectName = projectData.name;
            appState.buildings = projectData.buildings;
            appState.currentBuildingIndex = 0;
            
            elements.projectName.value = projectData.name;
            loadBuildingData(0);
            updateBuildingCounter();
            hideLoadModal();
            
            alert(`Project "${projectData.name}" loaded from file successfully!`);
            saveAppState();
            
        } catch (error) {
            alert('Error loading project file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// ===== EXPORT AND PRINT FUNCTIONS =====

/**
 * Print calculation results
 */
function printResults() {
    const printWindow = window.open('', '_blank');
    const results = getCurrentResults();
    
    if (!results) {
        alert('No calculation results to print. Please calculate first.');
        return;
    }
    
    const printContent = generatePrintableReport(results);
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Egress Calculation Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #2c3e50; }
                    .header { border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                    .section { margin: 20px 0; }
                    .result-grid { display: grid; gap: 10px; }
                    .result-item { padding: 10px; background: #f8f9fb; border-left: 4px solid #667eea; }
                    .calculation-details { font-family: Courier New; background: #f5f5f5; padding: 15px; margin: 10px 0; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                ${printContent}
                <div class="no-print" style="margin-top: 20px;">
                    <button onclick="window.print()">Print</button>
                    <button onclick="window.close()">Close</button>
                </div>
            </body>
        </html>
    `);
    
    printWindow.document.close();
}

/**
 * Export results to downloadable file
 */
function exportResults() {
    const results = getCurrentResults();
    
    if (!results) {
        alert('No calculation results to export. Please calculate first.');
        return;
    }
    
    const exportData = {
        projectName: appState.projectName || 'Untitled Project',
        buildingNumber: appState.currentBuildingIndex + 1,
        date: new Date().toISOString(),
        inputs: results.inputs,
        results: {
            occupantLoad: results.occupantLoad,
            egressWidths: results.egressWidths,
            doorWidth: results.doorWidth,
            totalWidth: results.totalWidth
        },
        calculationSummary: generateCalculationSummary(results.inputs, results),
        units: appState.currentUnits
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `egress-calculation-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Copy results to clipboard
 */
function copyResults() {
    const results = getCurrentResults();
    
    if (!results) {
        alert('No calculation results to copy. Please calculate first.');
        return;
    }
    
    const summary = generateCalculationSummary(results.inputs, results);
    
    navigator.clipboard.writeText(summary).then(() => {
        alert('Calculation results copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = summary;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Calculation results copied to clipboard!');
    });
}

/**
 * Get current calculation results
 * @returns {Object|null} Current results or null if none
 */
function getCurrentResults() {
    if (appState.buildings.length === 0) return null;
    return appState.buildings[appState.currentBuildingIndex]?.results || null;
}

/**
 * Generate printable report HTML
 * @param {Object} results - Calculation results
 * @returns {string} HTML for printable report
 */
function generatePrintableReport(results) {
    const date = new Date().toLocaleString();
    const widthUnits = appState.currentUnits === 'metric' ? 'mm' : 'inches';
    
    return `
        <div class="header">
            <h1>Egress & Occupant Load Calculation Report</h1>
            <p><strong>Project:</strong> ${appState.projectName || 'Untitled Project'}</p>
            <p><strong>Building:</strong> ${appState.currentBuildingIndex + 1} of ${appState.buildings.length}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Units:</strong> ${appState.currentUnits === 'metric' ? 'Metric' : 'Imperial'}</p>
        </div>
        
        <div class="section">
            <h2>Input Parameters</h2>
            <div class="result-grid">
                <div class="result-item"><strong>State/Jurisdiction:</strong> ${results.inputs.state}</div>
                <div class="result-item"><strong>IBC Code Version:</strong> ${results.inputs.ibcVersion}</div>
                <div class="result-item"><strong>Occupancy Classification:</strong> ${results.inputs.occupancy}</div>
                <div class="result-item"><strong>Floor Area:</strong> ${formatArea(results.inputs.floorArea)}</div>
                <div class="result-item"><strong>Automatic Sprinkler System:</strong> ${results.inputs.hasSprinklers ? 'Yes' : 'No'}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Calculation Results</h2>
            <div class="result-grid">
                <div class="result-item"><strong>Calculated Occupant Load:</strong> ${results.occupantLoad} occupants</div>
                <div class="result-item"><strong>Required Stair Width:</strong> ${formatWidth(results.egressWidths.stairs)}</div>
                <div class="result-item"><strong>Required Other Components Width:</strong> ${formatWidth(results.egressWidths.other)}</div>
                ${results.doorWidth ? `<div class="result-item"><strong>Minimum Door Width:</strong> ${formatWidth(results.doorWidth)}</div>` : ''}
                ${results.totalWidth ? `<div class="result-item"><strong>Total Required Exit Width:</strong> ${formatWidth(results.totalWidth)}</div>` : ''}
            </div>
        </div>
        
        <div class="section">
            <h2>Calculation Details</h2>
            <div class="calculation-details">
                ${generateCalculationSummary(results.inputs, results).replace(/\n/g, '<br>')}
            </div>
        </div>
        
        <div class="section">
            <h2>Code Notice</h2>
            <div class="result-item">
                ${results.notice}
            </div>
        </div>
        
        <div class="section">
            <p><strong>Disclaimer:</strong> This calculation is for preliminary design purposes only. 
            Always consult with local authorities and verify current code requirements before finalizing any design.</p>
        </div>
    `;
}

// ===== UI HELPER FUNCTIONS =====

/**
 * Update area help text based on current inputs
 */
function updateAreaHelp() {
    const occupancy = elements.occupancy.value;
    const area = elements.floorArea.value;
    
    let helpText = '';
    
    if (occupancy && AREA_TYPES[occupancy]) {
        const areaType = AREA_TYPES[occupancy];
        helpText = `Enter ${areaType.toLowerCase()} floor area. `;
        
        if (areaType === 'Net') {
            helpText += 'Net area excludes non-occupiable spaces like mechanical rooms, stairs, and walls.';
        } else {
            helpText += 'Gross area includes the entire floor area within the exterior walls.';
        }
    }
    
    if (area && occupancy) {
        const factor = getAreaFactor(elements.ibcVersion.value, occupancy);
        if (factor) {
            const estimatedLoad = Math.ceil(area / factor);
            helpText += ` Estimated occupant load: ${estimatedLoad} people.`;
        }
    }
    
    elements.areaHelp.textContent = helpText;
}

/**
 * Toggle advanced options visibility
 */
function toggleAdvancedOptions() {
    appState.showAdvanced = !appState.showAdvanced;
    
    const advancedElements = document.querySelectorAll('.advanced-options');
    advancedElements.forEach(el => {
        if (appState.showAdvanced) {
            el.classList.add('show');
        } else {
            el.classList.remove('show');
        }
    });
    
    elements.advancedToggle.textContent = appState.showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options';
    saveAppState();
}

// ===== LOCAL STORAGE FUNCTIONS =====

/**
 * Save application state to localStorage
 */
function saveAppState() {
    const stateToSave = {
        currentUnits: appState.currentUnits,
        projectName: appState.projectName,
        buildings: appState.buildings,
        currentBuildingIndex: appState.currentBuildingIndex,
        showAdvanced: appState.showAdvanced,
        calculationHistory: appState.calculationHistory
    };
    
    localStorage.setItem('egressCalculatorState', JSON.stringify(stateToSave));
    localStorage.setItem('egressCalculationHistory', JSON.stringify(appState.calculationHistory));
}

/**
 * Load application state from localStorage
 */
function loadAppState() {
    try {
        const saved = localStorage.getItem('egressCalculatorState');
        if (saved) {
            const state = JSON.parse(saved);
            
            appState.currentUnits = state.currentUnits || 'imperial';
            appState.projectName = state.projectName || '';
            appState.buildings = state.buildings || [];
            appState.currentBuildingIndex = state.currentBuildingIndex || 0;
            appState.showAdvanced = state.showAdvanced || false;
            appState.calculationHistory = state.calculationHistory || [];
            
            // Restore project name
            if (elements.projectName) {
                elements.projectName.value = appState.projectName;
            }
        }
        
        // Load calculation history separately for backward compatibility
        const historyData = localStorage.getItem('egressCalculationHistory');
        if (historyData && appState.calculationHistory.length === 0) {
            appState.calculationHistory = JSON.parse(historyData);
        }
        
    } catch (error) {
        console.warn('Error loading saved state:', error);
        // Reset to defaults on error
        appState.currentUnits = 'imperial';
        appState.buildings = [];
        appState.currentBuildingIndex = 0;
        appState.showAdvanced = false;
        appState.calculationHistory = [];
    }
}

// ===== VALIDATION HELPERS =====

/**
 * Validate all required inputs with enhanced checks
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateInputs() {
    const state = elements.state.value;
    const ibcVersion = elements.ibcVersion.value;
    const occupancy = elements.occupancy.value;
    const floorArea = parseFloat(elements.floorArea.value);
    const sprinkler = elements.sprinkler.value;
    const exitDoors = parseInt(elements.exitDoors.value);

    if (!state) {
        return { isValid: false, message: 'Please select a state/jurisdiction.' };
    }

    if (!ibcVersion) {
        return { isValid: false, message: 'Please select an IBC code version.' };
    }

    if (!occupancy) {
        return { isValid: false, message: 'Please select an occupancy classification.' };
    }

    if (!floorArea || floorArea <= 0) {
        return { isValid: false, message: 'Please enter a valid floor area greater than 0.' };
    }

    if (!sprinkler) {
        return { isValid: false, message: 'Please specify if the building has an automatic sprinkler system.' };
    }

    // Advanced validation
    if (appState.showAdvanced && exitDoors && exitDoors < 1) {
        return { isValid: false, message: 'Number of exit doors must be at least 1.' };
    }

    // Check if the selected combination exists in our data
    if (!IBC_DATA[ibcVersion] || !IBC_DATA[ibcVersion][occupancy]) {
        return { 
            isValid: false, 
            message: 'Invalid combination of IBC version and occupancy classification.' 
        };
    }

    // Area size warnings
    const maxReasonableArea = appState.currentUnits === 'metric' ? 100000 : 1000000; // 100k sq m or 1M sq ft
    if (floorArea > maxReasonableArea) {
        const units = appState.currentUnits === 'metric' ? 'square meters' : 'square feet';
        if (!confirm(`The entered area (${floorArea.toLocaleString()} ${units}) seems very large. Continue with calculation?`)) {
            return { isValid: false, message: 'Calculation cancelled by user.' };
        }
    }

    return { isValid: true };
}

/**
 * Enhanced error display with better UX
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Create a more user-friendly error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        z-index: 10000;
        max-width: 400px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">⚠️</span>
            <div>
                <strong>Validation Error</strong><br>
                ${message}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-left: auto;">✕</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Add CSS animation if not already added
    if (!document.getElementById('error-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'error-animation-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== KEYBOARD SHORTCUTS =====

/**
 * Add keyboard support for better UX
 */
document.addEventListener('keydown', function(event) {
    // Enter key to calculate (when not in a button)
    if (event.key === 'Enter' && event.target.tagName !== 'BUTTON' && !event.target.closest('.modal')) {
        event.preventDefault();
        calculateEgress();
    }
    
    // Ctrl+S to save project
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveProject();
    }
    
    // Ctrl+N for new project
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        newProject();
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        hideHistoryModal();
        hideLoadModal();
    }
});

// ===== UTILITY FUNCTIONS =====

/**
 * Format number with commas for better readability
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add debounced area help update
const debouncedAreaHelp = debounce(updateAreaHelp, 300);
if (elements.floorArea) {
    elements.floorArea.addEventListener('input', debouncedAreaHelp);
}

// ===== INITIALIZATION =====

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Auto-save state periodically
setInterval(saveAppState, 30000); // Save every 30 seconds

// Handle page unload
window.addEventListener('beforeunload', function() {
    saveCurrentBuildingData();
    saveAppState();
});

// Add window focus event to refresh saved projects
window.addEventListener('focus', function() {
    loadSavedProjects();
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateOccupantLoad,
        calculateEgressWidths,
        calculateDoorWidth,
        calculateTotalExitWidth,
        generateCodeNotice,
        validateInputs,
        convertUnits,
        getAreaFactor,
        formatArea,
        formatWidth,
        formatLength,
        IBC_DATA,
        EGRESS_FACTORS,
        AREA_TYPES,
        CODE_REFERENCES,
        UNIT_CONVERSION
    };
}
