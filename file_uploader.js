const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const pinFileToIPFS = (path, pinataApiKey, pinataSecretApiKey, success, failed) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append('file', fs.createReadStream(path));

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(function (response) {
            success(response)
            // console.log("success:", response.data.IpfsHash)
        })
        .catch(function (error) {
            failed(error)
            // console.log("failed:", error)
        });
};

function uploadSingleFile(path){
    let api_key = "680554e8be3a6506ff7a"
    let api_secret = "06737e691e5ad1ba42e4cf01de4bcf0e8103587d715edb16c3f219e5f4b72a2e"
    pinFileToIPFS(path, api_key, api_secret)
}

module.exports = {
    pinFileToIPFS: pinFileToIPFS
}

// uploadSingleFile("../nft/file/images/0a84a9b9cb1f175c96124dbc70955790.png")
// listFilesInFolder("../nft/file/images")