let manufacturerDropdown = document.getElementById('manufacturerDropdown');
let manufacturerFormName = document.getElementById('manufacturerFormName');
let manufacturerSubmitButton = document.getElementById('manufacturerSubmitButton');
let manufacturersForm = document.getElementById('manufacturersForm');
let manufacturerDeleteButton = document.getElementById('manufacturerDeleteButton');

let modelsListDiv = document.getElementById('modelsListDiv');
let modelsDropdown = document.getElementById('modelDropdown');
let modelsFormName = document.getElementById('modelsFormName');
let modelsForm = document.getElementById('modelsForm')
let modelsDeleteButton = document.getElementById('modelsDeleteButton');
let modelsSubmitButton = document.getElementById('modelsSubmitButton');


let selectedManufacturer = 0;


function loadManufacturers() {
    axios.get('/api/manufacturers').then(res => {
        manufacturerDropdown.disabled = false;
        manufacturerDropdown.innerHTML = '<option value="" id="">(New Manufacturer)</option>';
        const { data } = res;

        data.forEach(manufacturer => {  
            let selectField = document.createElement('option');

            selectField.innerText = manufacturer.name;
            selectField.setAttribute('id', manufacturer.manufacturer_id);
            selectField.setAttribute('value', manufacturer.name);

            manufacturerDropdown.appendChild(selectField);            
        })

        try {
            var manufacturerOptions = manufacturerDropdown.options;
        
            if(selectedManufacturer > 0) {
                for(var i = 1; i < manufacturerOptions.length; i++) {
                    if(+manufacturerOptions[i].id === +selectedManufacturer) {
                        manufacturerDropdown[i].selected = true;
                        break;
                    }
                }
            }
            else manufacturerDropdown.selectedIndex = 0;

            // Simulate change event.
            manufacturerDropdown.dispatchEvent(new Event('change'));
        }
        catch(error) {
            console.log(error)
        }
        console.log('Manufacturers loaded.');
    })
    .catch(err => {
        console.log(err);
    })
}

function loadModels() {
    modelsListDiv.innerHTML = '<div class="loadingCircle"></div>';
    modelsListDiv.style = `margin-top: auto;
    margin-bottom: auto;`

    
    if(+manufacturerDropdown.selectedIndex === 0) {
        return;
    }

    axios.get(`/api/models/${manufacturerDropdown[manufacturerDropdown.selectedIndex].id}`).then(res => {
        modelsListDiv.innerHTML = '';
        modelsListDiv.style = '';

        modelsDropdown.innerHTML = '<option value="" id="">(New Model)</option>';
        modelsDropdown.selectedIndex = 0; 

        let modelElement = document.createElement('div');
        modelElement.innerText = '(Create New Model)';
        modelElement.setAttribute('id', '');
        modelElement.setAttribute('onclick', "loadModelDetails(id)");
        modelElement.setAttribute('style', 'cursor: pointer;');

        modelsListDiv.appendChild(modelElement);

        modelsDropdown.disabled = false;

        const { data } = res;

        data.forEach(model => {  
            let modelElement = document.createElement('div');
            modelElement.innerText = model.name;
            modelElement.setAttribute('id', model.model_id);
            modelElement.setAttribute('onclick', "loadModelDetails(id)");
            modelElement.setAttribute('style', 'cursor: pointer;');
    
            modelsListDiv.appendChild(modelElement);


            // MODEL DROPDOWN LIST
            let selectField = document.createElement('option');

            selectField.innerText = model.name;
            selectField.setAttribute('id', model.model_id);
            selectField.setAttribute('value', model.name);

            modelsDropdown.appendChild(selectField);    
        })
    })
}

function loadModelDetails(id) {

    if(id === '') {
        modelsDropdown.selectedIndex = 0;
    }

    var modelOptions = modelsDropdown.options;

    for(var i = 1; i < modelOptions.length; i++) {
        if(+modelOptions[i].id === +id) {
            modelOptions[i].selected = true;
            break;
        }
    }

    modelsDropdown.dispatchEvent(new Event('change'));
}

function submitManufacturer(event) {
    event.preventDefault();

    if(manufacturerFormName.value.trim() === '') return;

    let manufacturerID = manufacturerDropdown[manufacturerDropdown.selectedIndex].id;

    let body = {
        manufacturerName: manufacturerFormName.value,
    }

    if(manufacturerID === '') {
        axios.post(`/api/manufacturers/`, body).then(res => {
            console.log(res);

            const {manufacturer_id} = res.data[0];
            selectedManufacturer = manufacturer_id;

            loadManufacturers();
        })

        .catch(err => console.log(err));
    }
    else {
        axios.put(`/api/manufacturers/${manufacturerID}`, body).then(res => {
            console.log(res);
            
            selectedManufacturer = manufacturerID;
            loadManufacturers();
        })

        .catch(err => console.log(err));
    }

}

function submitModel(event) {
    event.preventDefault();

    if(modelsFormName.value.trim() === '') return;


    let modelID = modelsDropdown[modelsDropdown.selectedIndex].id;

    let body = {
        manufacturerID: manufacturerDropdown[manufacturerDropdown.selectedIndex].id,
        modelName: modelsFormName.value,
    }

    if(modelsDropdown.selectedIndex === 0) {
        axios.post(`/api/models/`, body).then(res => {
            console.log(res);

            modelsDropdown.selectedIndex = 0;
            modelsDropdown.dispatchEvent(new Event('change'));
            loadModels();
        })

        .catch(err => console.log(err));
    }
    else {
        axios.put(`/api/models/${modelID}`, body).then(res => {
            console.log(res);
            loadModels();
        })

        .catch(err => console.log(err));
    }

}

function deleteFromDB(type, id) {
    axios.delete(`/api/${type}s/${id}`).then(res => {
        console.log(res.data);

        switch(type) {
            case "manufacturer":
                selectedManufacturer = 0;
                loadManufacturers();
                break;
    
            case "model":
                modelsDropdown.selectedIndex = 0;
                modelsDropdown.dispatchEvent(new Event('change'));
                loadModels();
                break;
        }
    })

    .catch(err => {
        console.log(err);
    })
}

manufacturerDropdown.addEventListener('change', () => {

    // RESET MODELS DROPDOWN
    modelsDropdown.innerHTML = '<option value="" id="">(New Model)</option>';
    modelsDropdown.selectedIndex = 0;
    modelsFormName.value = '';

    // Simulate change event.
    modelsDropdown.dispatchEvent(new Event('change'));
    modelsDropdown.disabled = true;

    // TODO: Figure out how to optimize this piece of code.
    if(manufacturerDropdown.selectedIndex === 0) {
        modelsListDiv.innerHTML = '';
        modelsListDiv.style = ''; 
    }

    manufacturerFormName.value = (manufacturerDropdown.selectedIndex === 0) ?'' : manufacturerDropdown[manufacturerDropdown.selectedIndex].value;
    manufacturerSubmitButton.value = (manufacturerDropdown.selectedIndex === 0) ? 'Create' : 'Update';
    manufacturerDeleteButton.disabled = (manufacturerDropdown.selectedIndex === 0) ?true : false;
    
    if(manufacturerDropdown.selectedIndex > 0) loadModels();
});

manufacturersForm.addEventListener('submit', submitManufacturer);

modelsDropdown.addEventListener('change', () => {

    modelsFormName.value = modelsDropdown[modelsDropdown.selectedIndex].value;
    modelsFormName.disabled = (manufacturerDropdown.selectedIndex === 0) ? true : false;
    modelsDeleteButton.disabled = (modelsDropdown.selectedIndex === 0) ? true : false;
    modelsSubmitButton.disabled = (manufacturerDropdown.selectedIndex === 0) ? true : false;

    modelsSubmitButton.value = (modelsDropdown.selectedIndex === 0) ? 'Create' : 'Update';
});

modelsForm.addEventListener('submit', submitModel);

window.addEventListener('load', () => {
    loadManufacturers();
})