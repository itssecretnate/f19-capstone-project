// ASSET ID
let assetIDInput = document.getElementById('assetID');
// NAME
let assetNameInput = document.getElementById('assetName');
// MANUFACTURER
let manufacturerList = document.getElementById('assetManufacturer');
// MODEL

let assetList = document.querySelector('.assetList');
let deleteButotn = document.getElementById('deleteButton');

let editingAsset = false;


window.addEventListener('load', () => {

    // TODO: See if I can do 2 queries in a another class, and return 2 objects.

    // Load assets when page is ready.
    loadAssets();
    loadManufacturers();

  })

function loadDetails(id) {
    axios.get(`/api/assets/${id}`).then(res => {
        assetIDInput.value = res.data[0].asset_id;
        assetNameInput.value = res.data[0].name;

        editingAsset = true; // TODO: Modify text of submit button.
        deleteButotn.disabled = !editingAsset; // TODO: See if there's a way to dynamically change the button state.

        var options = manufacturerList.options.length;
        for(var i = 0; i < options; i++) {
            if(manufacturerList.options[i].value == res.data[0].manufacturer) {
                manufacturerList.options[i].selected = true;
                break;
            }
            else if(res.data[0].manufacturer === null) {
                manufacturerList.options[0].selected = true;
                break;
            }
        }
    })
}

function loadAssets() {
    assetList.innerHTML = '';
    axios.get('/api/assets').then(res => {

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
    }).catch(err => console.log(err));
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

function newAsset() {    
    editingAsset = false;
    deleteButton.disabled = !editingAsset;
    
    assetIDInput.value = 'TBD';
    assetNameInput.value = "New Asset";
    manufacturerList.options[0].selected = true;
}

function submitAsset() {
    let body = {
        assetName: assetNameInput.value,
        manufacturer: (manufacturerList[manufacturerList.selectedIndex].id === 'null') ? '' : manufacturerList[manufacturerList.selectedIndex].id
    }
    if(!editingAsset) {
        axios.post('/api/new/asset', body).then(res => {
            // console.log('New');
            // console.log(res);

            const {asset_id} = res.data[0];

            assetIDInput.value = asset_id;
            // console.log(asset_id);
            
            editingAsset = true;
            deleteButton.disabled = !editingAsset;

            loadAssets();
        }).catch(err => console.log(err));
    }

    else {
        body.assetID = assetIDInput.value;

        axios.put(`/api/update/asset`, body).then(res => {
            console.log('Update: ');
            console.log(res);

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