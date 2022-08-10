const functions = require("firebase-functions");
var admin = require("firebase-admin");
admin.initializeApp();
const { getFirestore } = require('firebase-admin/firestore')
const db = getFirestore();
const { Storage } = require('@google-cloud/storage');
const path = require("path");
const { Initializer } = require('./zoho-crm/initializer.js');
const { BulkWrite } = require('./zoho-crm/bulkWrite.js');
var zip = require('file-zip');
const ObjectsToCsv = require('objects-to-csv');
const os = require('os');
const { GetRecord } = require("./zoho-crm/getRecord.js");
const { BulkRead } = require("./zoho-crm/bulkRead");
const extract = require('extract-zip')
const csv = require('csvtojson')

//1 12 1-31 1-12 1-7 for Schedule Funcitons

// For Development

// exports.sendToContactsModule = functions.https.onRequest(async (req, res) => {
//   await Initializer.initialize(); //For ZOHO Initializing 
//   const bucketName = 'gs://dadeauctions.appspot.com';
//   //const filePath = './Contacts.zip';
//   const destFileName = 'Contacts.zip';
//   const storage = new Storage();
//   try {
//     let usersData = db.collection('users').where('isSynced', '==', false);
//     let usersList = [];
//     let usersID = [];
//     let dataList = await usersData.get(); //Getting data from Firebase where isSynced value is false
//     console.log(dataList.docs.length);
//     for (const doc of dataList.docs) {
//       usersList.push(doc.data()); // Pushing above getting data to the new List
//       usersID.push(doc.id);
//     }
//     let converter = (usersList) => {
//       let newRes = {};
//       Object.keys(usersList).map((item) => {
//         if (typeof usersList[item] === "object" && !usersList[item].length) {
//           newRes = { ...newRes, ...usersList[item] }
//         } else {
//           newRes = { ...newRes, [item]: usersList[item] }
//         }
//       })
//       return newRes;
//     }
//     let newArr = usersList.map(item => converter(item)); // This will convert object Fields in to single fields

//     //console.log(newArr);
//     (async () => {
//       if (newArr.length > 0) {
//         // Below lines of Code fixed the indexing of the fields
//         const [first, ...restOfArr] = newArr
//         const {
//           contactName,
//           name,
//           company,
//           textMessage,
//           newsLetter,
//           title,
//           mobileNumber,
//           emailAddress,
//           phoneNumber,
//           email,
//           isPrimaryContact,
//           isSynced,
//           secondaryAccount,
//           status
//         } = first
//         const firstElement = {
//           contactName,
//           name,
//           company,
//           textMessage,
//           newsLetter,
//           title,
//           mobileNumber,
//           emailAddress,
//           phoneNumber,
//           email,
//           isPrimaryContact,
//           isSynced,
//           secondaryAccount,
//           status
//         }
//         const csv = new ObjectsToCsv([firstElement, ...restOfArr]); // This will create a CSV file 
//         //Below lines of Code Save CSV file and convert it into Zip format:
//         //const tempCSVFilePath = path.join(os.tmpdir(), './Contacts.csv');
//         //const tempZipFilePath = path.join(os.tmpdir(), './Contacts.zip');

//         await csv.toDisk('./Contacts.csv').then((result) => {
//           zip.zipFile(['./Contacts.csv'], './Contacts.zip', async function (err) {
//             if (err) {
//               console.log('zip error', err)
//             } else {
//               console.log('zip success');
//               //console.log(tempZipFilePath);
//               try {
//                 await storage.bucket(bucketName).upload('./Contacts.zip', {
//                   destination: destFileName,
//                 });
//                 console.log(`${'./Contacts.zip'} uploaded to ${bucketName}`);
//               } catch (error) {
//                 console.log(error);
//               }
//               myFileID = await BulkWrite.uploadFile("778981122", './Contacts.zip'); // Obtaining FileID from this method
//               await BulkWrite.createBulkWriteJobContacts("Contacts", myFileID); // Push Data to Module Using CSV File
//               // Below lines of code update the isSynced value to true after pushing the data to Zoho
//               for(let i = 0 ; i < usersID.length ; i++){
//                 db.collection("users").doc(usersID[i]).update({isSynced: true})
//               }
//               console.log("Data Updated...")
//             }
//           });
//         }).catch((err) => {
//           console.log("Error");
//         });
//       }
//       else {
//         console.log("No Operation Perform...");
//       }
//     })();
//   } catch (error) {
//     console.log("Error");
//   }
// });

// For Production

exports.sendToContactsModule = functions.https.onRequest(async (req, res) => {
  await Initializer.initialize(); //For ZOHO Initializing 
  const bucketName = 'gs://dadeauctions.appspot.com';
  //const filePath = './Contacts.zip';
  const destFileName = 'Contacts.zip';
  const storage = new Storage();
  try {
    let usersData = db.collection('users').where('isSynced', '==', false);
    let usersList = [];
    let usersID = [];
    let dataList = await usersData.get(); //Getting data from Firebase where isSynced value is false
    console.log(dataList.docs.length);
    for (const doc of dataList.docs) {
      usersList.push(doc.data()); // Pushing above getting data to the new List
      usersID.push(doc.id);
    }
    usersList.forEach((element, i) => {
      element.FirebaseID = usersID[i];
    });
    let converter = (usersList) => {
      let newRes = {};
      Object.keys(usersList).map((item) => {
        if (typeof usersList[item] === "object" && !usersList[item].length) {
          newRes = { ...newRes, ...usersList[item] }
        } else {
          newRes = { ...newRes, [item]: usersList[item] }
        }
      })
      return newRes;
    }
    let newArr = usersList.map(item => converter(item)); // This will convert object Fields in to single fields

    //console.log(newArr);
    (async () => {
      if (newArr.length > 0) {
        // Below lines of Code fixed the indexing of the fields
        const [first, ...restOfArr] = newArr
        const {
          contactName,
          name,
          company,
          textMessage,
          newsLetter,
          title,
          mobileNumber,
          emailAddress,
          phoneNumber,
          email,
          isPrimaryContact,
          isSynced,
          secondaryAccount,
          status,
          FirebaseID
        } = first
        const firstElement = {
          contactName,
          name,
          company,
          textMessage,
          newsLetter,
          title,
          mobileNumber,
          emailAddress,
          phoneNumber,
          email,
          isPrimaryContact,
          isSynced,
          secondaryAccount,
          status,
          FirebaseID
        }
        const csv = new ObjectsToCsv([firstElement, ...restOfArr]); // This will create a CSV file 
        //Below lines of Code Save CSV file and convert it into Zip format:
        const tempCSVFilePath = path.join(os.tmpdir(), './Contacts.csv');
        const tempZipFilePath = path.join(os.tmpdir(), './Contacts.zip');

        await csv.toDisk(tempCSVFilePath).then((result) => {
          zip.zipFile([tempCSVFilePath], tempZipFilePath, async function (err) {
            if (err) {
              console.log('zip error', err)
            } else {
              console.log('zip success');
              console.log(tempZipFilePath);
              try {
                await storage.bucket(bucketName).upload('/tmp/Contacts.zip', {
                  destination: destFileName,
                });
                console.log(`${tempZipFilePath} uploaded to ${bucketName}`);
              } catch (error) {
                console.log(error);
              }
              myFileID = await BulkWrite.uploadFile("778981122", '/tmp/Contacts.zip'); // Obtaining FileID from this method
              await BulkWrite.createBulkWriteJobContacts("Contacts", myFileID); // Push Data to Module Using CSV File
              // Below lines of code update the isSynced value to true after pushing the data to Zoho
              for (let i = 0; i < usersID.length; i++) {
                db.collection("users").doc(usersID[i]).update({ isSynced: true })
              }
              console.log("Data Updated...")
            }
          });
        }).catch((err) => {
          console.log("Error");
        });
      }
      else {
        console.log("No Operation Perform...");
      }
    })();
  } catch (error) {
    console.log("Error");
  }
});

// For Developement 

// exports.sendToAccountsModule = functions.https.onRequest(async (req, res) => {
//   await Initializer.initialize();
//   const bucketName = 'gs://dadeauctions.appspot.com';
//   //const filePath = './Contacts.zip';
//   const destFileName = 'Accounts.zip';
//   const storage = new Storage();
//   try {
//     var batch = db.batch();
//     let usersData = db.collection('companies').where('isSynced', '==', false);
//     let usersList = [];
//     let userID = [];
//     let myFileID;
//     //let docId = [];
//     let dataList = await usersData.get();
//     console.log(dataList.docs.length);
//     for (const doc of dataList.docs) {
//       usersList.push(doc.data());
//       userID.push(doc.id);
//     }
//     usersList.forEach((element , i) => {
//       element.FirebaseID = userID[i];
//     });
//     //console.log(usersList);
//     let converter = (usersList) => {
//       let newRes = {};
//       Object.keys(usersList).map((item) => {
//         if (typeof usersList[item] === "object" && !usersList[item].length) {
//           newRes = { ...newRes, ...usersList[item] }
//         } else {
//           newRes = { ...newRes, [item]: usersList[item] }
//         }
//       })
//       return newRes;
//     }
//     let newArr = usersList.map(item => converter(item));

//     console.log(newArr);
//     (async () => {
//       if (newArr.length > 0) {
//         const [first, ...restOfArr] = newArr
//         const {
//           companyName,
//           accountType,
//           descriptionInfo,
//           MSA,
//           sector,
//           isSynced,
//           email,
//           mobileNumber,
//           websiteURL,
//           phoneNumber,
//           streetAddress,
//           country,
//           state,
//           zipCode,
//           streetAddress2,
//           city,
//           status,
//           primaryContact,
//           FirebaseID,
//         } = first
//         const firstElement = {
//           companyName,
//           accountType,
//           descriptionInfo,
//           MSA,
//           sector,
//           isSynced,
//           email,
//           mobileNumber,
//           websiteURL,
//           phoneNumber,
//           streetAddress,
//           country,
//           state,
//           zipCode,
//           streetAddress2,
//           city,
//           status,
//           primaryContact,
//           FirebaseID,
//         }
//         const csv = new ObjectsToCsv([firstElement, ...restOfArr]);
//         // Save to file:
//         await csv.toDisk('./Accounts.csv');
//         zip.zipFile(['./Accounts.csv'], 'Accounts.zip', async function (err) {
//           if (err) {
//             console.log('zip error', err)
//           } else {
//             console.log('zip success');
//             try {
//               await storage.bucket(bucketName).upload('./Accounts.zip', {
//                 destination: destFileName,
//               });
//               console.log(`${'./Accounts.zip'} uploaded to ${bucketName}`);
//             } catch (error) {
//               console.log(error);
//             }
//             myFileID = await BulkWrite.uploadFile("778981122", "./Accounts.zip");
//             await BulkWrite.createBulkWriteJobAccounts("Accounts", myFileID);
//             db.collection("companies").get().then(function (querySnapshot) {
//               querySnapshot.forEach(function (doc) {
//                 doc.ref.update({
//                   isSynced: true
//                 });
//               });
//               console.log("Data Updated...")
//             });
//           }
//         });
//         console.log("Success");
//       }
//       else {
//         console.log("No Operation Perform...");
//       }
//     })();
//   } catch (error) {
//     res.send(error);
//   }
// });

// For Production

exports.sendToAccountsModule = functions.https.onRequest(async (req, res) => {
  await Initializer.initialize();
  const bucketName = 'gs://dadeauctions.appspot.com';
  //const filePath = './Contacts.zip';
  const destFileName = 'Accounts.zip';
  const storage = new Storage();
  try {
    var batch = db.batch();
    let usersData = db.collection('companies').where('isSynced', '==', false);
    let usersList = [];
    let usersID = [];
    let myFileID;
    //let docId = [];
    let dataList = await usersData.get();
    console.log(dataList.docs.length);
    for (const doc of dataList.docs) {
      usersList.push(doc.data());
      usersID.push(doc.id);
    }
    usersList.forEach((element, i) => {
      element.FirebaseID = usersID[i];
    });
    let converter = (usersList) => {
      let newRes = {};
      Object.keys(usersList).map((item) => {
        if (typeof usersList[item] === "object" && !usersList[item].length) {
          newRes = { ...newRes, ...usersList[item] }
        } else {
          newRes = { ...newRes, [item]: usersList[item] }
        }
      })
      return newRes;
    }
    let newArr = usersList.map(item => converter(item));
    (async () => {
      if (newArr.length > 0) {
        const [first, ...restOfArr] = newArr
        const {
          companyName,
          accountType,
          descriptionInfo,
          MSA,
          sector,
          isSynced,
          email,
          mobileNumber,
          websiteURL,
          phoneNumber,
          streetAddress,
          country,
          state,
          zipCode,
          streetAddress2,
          city,
          status,
          primaryContact,
          FirebaseID,
        } = first
        const firstElement = {
          companyName,
          accountType,
          descriptionInfo,
          MSA,
          sector,
          isSynced,
          email,
          mobileNumber,
          websiteURL,
          phoneNumber,
          streetAddress,
          country,
          state,
          zipCode,
          streetAddress2,
          city,
          status,
          primaryContact,
          FirebaseID,
        }
        const csv = new ObjectsToCsv([firstElement, ...restOfArr]);

        const tempCSVFilePath = path.join(os.tmpdir(), './Accounts.csv');
        const tempZipFilePath = path.join(os.tmpdir(), './Accounts.zip');
        // Save to file:
        await csv.toDisk(tempCSVFilePath).then((result) => {
          zip.zipFile([tempCSVFilePath], tempZipFilePath, async function (err) {
            if (err) {
              console.log('zip error', err)
            } else {
              console.log('zip success');
              console.log(tempZipFilePath);
              try {
                await storage.bucket(bucketName).upload('/tmp/Accounts.zip', {
                  destination: destFileName,
                });
                console.log(`${tempZipFilePath} uploaded to ${bucketName}`);
              } catch (error) {
                console.log(error);
              }
              myFileID = await BulkWrite.uploadFile("778981122", '/tmp/Accounts.zip'); // Obtaining FileID from this method
              await BulkWrite.createBulkWriteJobAccounts("Accounts", myFileID); // Push Data to Module Using CSV File
              // Below lines of code update the isSynced value to true after pushing the data to Zoho
              for (let i = 0; i < usersID.length; i++) {
                db.collection("companies").doc(usersID[i]).update({ isSynced: true })
              }
              console.log("Data Updated...")
            }
          });
        }).catch((err) => {
          console.log("Error");
        });
      }
      else {
        console.log("No Operation Perform...");
      }
    })();
  } catch (error) {
    res.send(error);
  }
});

// For Developement and Production

// exports.sendFromContactsModule = functions.https.onRequest(async (req, res) => {
//   await Initializer.initialize();
//   const resData = await GetRecord.getAccountsRecord();

//   // console.log(resData.object.data);
//   console.log(resData.object.data.length);
//   let result = resData.object.data.map(a => a.FirebaseID);

//   // try {
//   //   await db.collection("Contacts_Module").doc().create(resData);
//   //   return res.status(200).send({ status: "Success", msg: "Data Added" });
//   // } catch (error) {
//   //   console.log(error);
//   //   return res.status(500).send({ status: "Failed", msg: "Data not Added" });
//   // }

//   var batch = db.batch();
//   for (let i = 0; i < resData.object.data.length; i++) {
//     batch.set(db.collection("Contacts_Module").doc(result[i]), resData.object.data[i]);
//     //batch.update(db.collection("Products_Module").doc(`${i}`), { isSsynced: false })
//   }

//   // documentIds.forEach(docId => {
//   //   batch.set(db.doc(`Users/${docId}`), data);
//   // })

//   batch.commit().then(response => {
//     console.log('Success');
//   }).catch(err => {
//     console.error(err);
//   })
// });

// // For Developement and Production

// exports.sendFromAccountsModule = functions.https.onRequest(async (req, res) => {
//   await Initializer.initialize();
//   const resData = await GetRecord.getAccountsRecord();

//   // console.log(resData.object.data);
//   console.log(resData.object.data.length);
//   let result = resData.object.data.map(a => a.FirebaseID);

//   // try {
//   //   await db.collection("Contacts_Module").doc().create(resData);
//   //   return res.status(200).send({ status: "Success", msg: "Data Added" });
//   // } catch (error) {
//   //   console.log(error);
//   //   return res.status(500).send({ status: "Failed", msg: "Data not Added" });
//   // }

//   var batch = db.batch();
//   for (let i = 0; i < resData.object.data.length; i++) {
//     batch.set(db.collection("Accounts_Module").doc(result[i]), resData.object.data[i]);
//     //batch.update(db.collection("Products_Module").doc(`${i}`), { isSsynced: false })
//   }

//   // documentIds.forEach(docId => {
//   //   batch.set(db.doc(`Users/${docId}`), data);
//   // })

//   batch.commit().then(response => {
//     console.log('Success');
//   }).catch(err => {
//     console.error(err);
//   })
// });


exports.sendFromContactsModule = functions.https.onRequest(async (req, res) => {
  await Initializer.initialize();
  let myFileID = await BulkRead.createBulkReadJobForContacts("Contacts");
  let myID = BigInt(myFileID);
  async function myFunc(arg) {
    //const tempCSVFilePath = path.join(os.tmpdir(), './Accounts.csv');
    await BulkRead.downloadResult(myID, path.join(os.tmpdir(), './'));
    const zipFormat = ".zip";
    const csvFormat = ".csv";
    const concatinateForZip = myFileID + zipFormat;
    const concatinateForCSV = myFileID + csvFormat;
    const csvFilePath = path.join(os.tmpdir(), concatinateForCSV);
    console.log(csvFilePath);
    async function extractFunction() {
      try {
        await extract(path.join(os.tmpdir(), concatinateForZip), { dir: path.join(os.tmpdir(), "./") })
        console.log('Extraction complete');
        const zohoData = await csv().fromFile(csvFilePath);
        let result = zohoData.map(a => a.FirebaseID);
        var batch = db.batch();
        for (let i = 0; i < zohoData.length; i++) {
          batch.set(db.collection("Contacts").doc(result[i]), zohoData[i]);
          //batch.update(db.collection("Products_Module").doc(`${i}`), { isSsynced: false })
        }
        batch.commit().then(response => {
          console.log('Success');
        }).catch(err => {
          console.error(err);
        })
      } catch (err) {
        console.log(err);
      }
    }
    extractFunction();
  }
  setTimeout(myFunc, 20000, 'timer');
});

exports.sendFromAccountsModule = functions.https.onRequest(async (req, res) => {
  await Initializer.initialize();
  let myFileID = await BulkRead.createBulkReadJobForAccounts("Accounts");
  let myID = BigInt(myFileID);
  async function myFunc(arg) {
    //const tempCSVFilePath = path.join(os.tmpdir(), './Accounts.csv');
    await BulkRead.downloadResult(myID, path.join(os.tmpdir(), './'));
    const zipFormat = ".zip";
    const csvFormat = ".csv";
    const concatinateForZip = myFileID + zipFormat;
    const concatinateForCSV = myFileID + csvFormat;
    const csvFilePath = path.join(os.tmpdir(), concatinateForCSV);
    console.log(csvFilePath);
    async function extractFunction() {
      try {
        await extract(path.join(os.tmpdir(), concatinateForZip), { dir: path.join(os.tmpdir(), "./") })
        console.log('Extraction complete');
        const zohoData = await csv().fromFile(csvFilePath);
        let result = zohoData.map(a => a.FirebaseID);
        var batch = db.batch();
        for (let i = 0; i < zohoData.length; i++) {
          batch.set(db.collection("Accounts").doc(result[i]), zohoData[i]);
          //batch.update(db.collection("Products_Module").doc(`${i}`), { isSsynced: false })
        }
        batch.commit().then(response => {
          console.log('Success');
        }).catch(err => {
          console.error(err);
        })
      } catch (err) {
        console.log(err);
      }
    }
    extractFunction();
  }
  setTimeout(myFunc, 20000, 'timer');
});
