import { inbox } from "file-transfer";

// set POST target here
const POST_PATH = "http://192.168.1.19/file-storage-local/index.php";
console.log("Companion response.");
let queueFiles = [];

const upload = (fileContents, fileName) => {
  let flag = true;
  let newFile = new File([fileContents], fileName);
  const formData = new FormData();
  formData.append('file', newFile);
  fetch(POST_PATH, { // POST endpoint
    method: 'POST',
    body: formData // file object
  })
  .then(
    success => { // Handle the success response object
      console.log("Success, file sent to POST endpoint")
      flag = true;
     } 
  ).catch(
    error => { // Handle the error response object
      console.log("Error: " + error)
      flag = false;
    }
  );
  return flag;
};

async function processAllFiles() {
    let file;
    while ((file = await inbox.pop())) {
      const payload = await file.text();
      //let fileName = now();
      let fileName = file.name;
      let status = upload(payload, fileName);

      if (!status) {
        if (queueFiles.length > 10) queueFiles.shift();
          queueFiles.push([payload, fileName]);
      } else {
        while (queueFiles.length && status) {
          let [value, name] = queueFiles.shift();
          status = upload(value, name);
        }
      }
    }
}
  
inbox.addEventListener("newfile", processAllFiles);

processAllFiles()


  