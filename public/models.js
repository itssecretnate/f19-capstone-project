let manufacturerDropdown = document.getElementById('manufacturerDropdown');
let manufacturerFormName = document.getElementById('manufacturerFormName');
let manufacturerSubmitButton = document.getElementById('manufacturerSubmitButton');
let manufacturersForm = document.getElementById('manufacturersForm');

let modelsListDiv = document.getElementById('modelsListDiv');

let selectedManufacturer = 0;


function loadManufacturers() {
    axios.get('/api/manufacturers').then(res => {
        manufacturerDropdown.disabled = false;
        manufacturerDropdown.innerHTML = '<option value="" id=""></option>';
        const { data } = res;

        data.forEach(manufacturer => {  
            let selectField = document.createElement('option');

            selectField.innerText = manufacturer.name;
            selectField.setAttribute('id', manufacturer.manufacturer_id);
            selectField.setAttribute('value', manufacturer.name);

            manufacturerDropdown.appendChild(selectField);            
        })

        try {
        if(selectedManufacturer > 0) {
            var manufacturerOptions = manufacturerDropdown.options;
            for(var i = 1; i < manufacturerOptions.length; i++) {
                if(+manufacturerOptions[i].id === +selectedManufacturer) {
                    manufacturerDropdown[i].selected = true;

                    // Simulate change event.
                    manufacturerDropdown.dispatchEvent(new Event('change'));
                    break;
                }
            }
        }
        }
        catch(error) {
            console.log(error)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

function loadModels() {
    modelsListDiv.innerHTML = '<div class="loadingCircle"></div>';
    modelsListDiv.style = `margin-top: auto;
    margin-bottom: auto;`

    
    if(+manufacturerDropdown.selectedIndex === 0) return;

    axios.get(`/api/models/${+manufacturerDropdown.selectedIndex}`).then(res => {
        modelsListDiv.innerHTML = '';
        modelsListDiv.style = '';


        const { data } = res;

        data.forEach(model => {  


            let modelElement = document.createElement('div');
            modelElement.innerText = model.name;
            modelElement.setAttribute('id', model.model_id);
            modelElement.setAttribute('onclick', "loadModelDetails(id)");
            modelElement.setAttribute('style', 'cursor: pointer;');
    
            modelsListDiv.appendChild(modelElement);
        })
    })
}

function loadModelDetails(id) {
    console.log(id);
}

function submitManufacturer(event) {
    event.preventDefault();

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

manufacturerDropdown.addEventListener('change', () => {

    if(manufacturerDropdown.selectedIndex === 0) {
        manufacturerFormName.value = '';
        manufacturerSubmitButton.value = 'Create';
        return;
    }

    manufacturerFormName.value = manufacturerDropdown[manufacturerDropdown.selectedIndex].value;
    manufacturerSubmitButton.value = 'Update';
    loadModels();
});

manufacturersForm.addEventListener('submit', submitManufacturer);

window.addEventListener('load', () => {;
    loadManufacturers();

})