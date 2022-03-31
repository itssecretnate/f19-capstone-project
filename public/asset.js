// ASSET ID
let assetIDInput = document.getElementById('assetID');
// NAME
let assetNameInput = document.getElementById('assetName');
// MANUFACTURER
let manufacturerList = document.getElementById('assetManufacturer');
manufacturerList.addEventListener('change', loadModels);

// MODEL
let modelList = document.getElementById('assetModel');

// Hack to get model loading working.
let selectedModel = 0;

// Submit button
let submitButton = document.getElementById('submit');
let submitStartingValue = submitButton.value;

let assetList = document.querySelector('.assetList');
let deleteButotn = document.getElementById('deleteButton');

let editingAsset = false;


window.addEventListener('load', () => {

    // TODO: See if I can do 2 queries in a another class, and return 2 objects.

    // Load assets when page is ready.
    newAsset();
    loadAssets();
    loadManufacturers();
    // loadModels();

  })

function loadDetails(id) {
    axios.get(`/api/assets/${id}`).then(res => {
        assetIDInput.value = res.data[0].asset_id;
        assetNameInput.value = res.data[0].name;

        editingAsset = true;
        deleteButotn.disabled = !editingAsset; // TODO: See if there's a way to dynamically change the button state.

        submitButton.value = 'Update'

        selectedModel = res.data[0].model;


        var manufacturerOptions = manufacturerList.options.length;
        for(var i = 0; i < manufacturerOptions; i++) {
            if(manufacturerList.options[i].value == res.data[0].manufacturer) {
                manufacturerList.options[i].selected = true;
                break;
            }
            else if(res.data[0].manufacturer === null) {
                manufacturerList.options[0].selected = true;
                break;
            }
        }

        loadModels();
    })
}

function loadAssets() {
    assetList.innerHTML = '<div class="loadingCircle"></div>';
    assetList.style = `margin-top: auto;
    margin-bottom: auto;`
    axios.get('/api/assets').then(res => {
        assetList.innerHTML = '';
        assetList.style = '';

        const { data } = res;

        // List assets
        data.forEach(asset => {
            let assetElement = document.createElement('div');
            assetElement.innerText = asset.name;
            assetElement.setAttribute('id', asset.asset_id);
            assetElement.setAttribute('onclick', "loadDetails(id)");
            assetElement.setAttribute('style', 'cursor: pointer;');
    
            assetList.appendChild(assetElement);
        })
    }).catch(err => {
        console.log(err);
        assetList.innerHTML = '<p style="text-align: center;">Error loading assets.</p>';

        let form = document.getElementById('assetDetails').elements;
        console.log(form);

        for(let i in form) form[i].disabled = true;
    });
}

function loadManufacturers() {
    axios.get('/api/manufacturers').then(res => {
        manufacturerList.innerHTML = '<option value="null" id="null"></option>';
        const { data } = res;

        data.forEach(option => {  
            let selectField = document.createElement('option');

            selectField.innerText = option.name;
            selectField.setAttribute('id', option.manufacturer_id);
            selectField.setAttribute('value', option.name);

            manufacturerList.appendChild(selectField);            
        })
    })
}

function loadModels() {

    axios.get(`/api/models/${manufacturerList[manufacturerList.selectedIndex].id}`).then(res => {
        modelList.innerHTML = '<option value="null" id="null"></option>';
        const { data } = res;

        data.forEach(option => {  
            let selectField = document.createElement('option');

            selectField.innerText = option.name;
            selectField.setAttribute('id', option.model_id);
            selectField.setAttribute('value', option.name);

            modelList.appendChild(selectField);
        })

        if(selectedModel > 0) {
            var modelOptions = modelList.options.length;
            for(var i = 0; i < modelOptions; i++) {
                if(+modelList.options[i].id === +selectedModel) {
                    modelList.options[i].selected = true;
                    break;
                }
            }
        }
        else {
            modelList.options[0].selected = true;
        }

    })
}

function newAsset() {    
    editingAsset = false;
    deleteButton.disabled = !editingAsset;
    submitButton.value = submitStartingValue;
    
    assetIDInput.value = 'TBD';
    assetNameInput.value = "New Asset";
    manufacturerList.options[0].selected = true;
    modelList.options[0].selected = true;
    // TODO: Find me elegant way to clear the list.
    modelList.innerHTML = '<option value="null" id="null"></option>';
}

function submitAsset() {

    if(assetNameInput.value.includes('\'')) {
        alert('Contains apostraphe. Need to fix.');
        return;
    }
    let body = {
        assetName: assetNameInput.value,
        manufacturer: (manufacturerList.selectedIndex === 0) ? 'NULL' : manufacturerList[manufacturerList.selectedIndex].id,
        model_id: (modelList.selectedIndex === 0) ? 'NULL' : modelList[modelList.selectedIndex].id
    }

    if(body.assetName == '') {
        alert('Asset name cannot be empty.');
        return;
    }

    if(!editingAsset) {
        axios.post('/api/new/asset', body).then(res => {
            const {asset_id} = res.data[0];

            assetIDInput.value = asset_id;
            
            editingAsset = true;
            deleteButton.disabled = !editingAsset;
            submitButton.value = 'Update';

            loadAssets();
        }).catch(err => console.log(err));
    }

    else {
        body.assetID = assetIDInput.value;

        axios.put(`/api/update/asset`, body).then(res => {
            loadAssets();
        })
    }
}

function deleteAsset() {
    axios.delete(`/api/delete/${assetIDInput.value}`).then(res => {
        console.log(res);
        newAsset();
        loadAssets();
    });
}