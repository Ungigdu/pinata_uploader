const { pinFileToIPFS } = require("./file_uploader.js")
const fs = require('fs');

function listFilesInFolder(folder, removeSuffix) {
    return fs.readdirSync(folder).map(file => removeSuffix ? file.split(".")[0] : file);
}

function loadTask(taskFile, imageFolder, jsonFolder) {
    let task;
    try {
        task = JSON.parse(fs.readFileSync(taskFile))
    } catch {
        //task not inited
        task = {}
        task["imageFolder"] = imageFolder
        task["jsonFolder"] = jsonFolder
        task["queued"] = listFilesInFolder(imageFolder, true)
        task["completed"] = []
        _saveTask(taskFile, task)
    }
    return task
}

function _saveTask(taskFile, task) {
    let data = JSON.stringify(task)
    fs.writeFileSync(taskFile, data)
}

/*
    instruction: {
        taskFile: "",
        imageFolder: "",
        imageSuffix: "",
        jsonFolder: "",
        api_key: "",
        api_secret: "",
        gate_way: "",
        dest_folder: "",
        name: "",
        description: "",
    }
*/
function runTask(instruction) {
    let task = loadTask(instruction.taskFile, instruction.imageFolder, instruction.jsonFolder)
    let index = task.completed.length
    if (task.queued.length == 0) {
        console.log("there is no more task")
        return
    }
    let hash = task.queued[0]
    let imagePath = instruction.imageFolder + "/" + hash + instruction.imageSuffix
    pinFileToIPFS(imagePath, instruction.api_key, instruction.api_secret,
        (response) => {
            console.log("[SUCCESS]:" + index + " with CID: " + response.data.IpfsHash)
            task.queued.shift()
            task.completed.push(hash)
            _saveTask(instruction.taskFile, task)
            //deal with json file
            let jsonPath = instruction.jsonFolder + "/" + hash + ".json"
            let orgJson = JSON.parse(fs.readFileSync(jsonPath))
            let targetJson = {}
            targetJson["name"] = instruction.name + " #" + index
            targetJson["attributes"] = orgJson.attributes
            targetJson["image"] = instruction.gate_way + response.data.IpfsHash
            targetJson["description"] = instruction.description
            let targetDate = JSON.stringify(targetJson)
            fs.writeFileSync(instruction.dest_folder + "/" + index, targetDate)
            runTask(instruction)
        },
        (error) => {
            console.log(error)
        })

}

//test
runTask({
    taskFile: "./task.json",
    imageFolder: "../nft/file/images",
    imageSuffix: ".png",
    jsonFolder: "../nft/file/json",
    api_key: "680554e8be3a6506ff7a",
    api_secret: "06737e691e5ad1ba42e4cf01de4bcf0e8103587d715edb16c3f219e5f4b72a2e",
    gate_way: "https://ipfs.io/ipfs/",
    dest_folder: "./dest_json",
    name: "Teddy Brick",
    description: "Teddy Brick Is Awesome!!",
})
