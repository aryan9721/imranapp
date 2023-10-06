import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import AWS from 'aws-sdk';
import axios from 'axios';

const MyComponent = () => {
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // Specify the allowed file types
      });
      sendRequest(result[0]);
    } catch (error) {
      console.error('Error picking a file:', error);
      setLoading(false);
    }
  };

  const sendRequest = async (selectedFile) => {
    const selectedFileUri = selectedFile.uri;
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    // Initialize AWS S3
    AWS.config.update({
      accessKeyId: 'AKIAYYKL2QMZN6X7IDWV', // Replace with your AWS access key
      secretAccessKey: 'fCINpREeRxWEUOLG6PvcV70IryUXYkpVobUG3hLj', // Replace with your AWS secret access key
      region: 'ap-south-1', // Replace with your desired AWS region

    });

    const s3 = new AWS.S3();

    // Specify the S3 bucket and key for the upload
    const bucketName = 'aaryan-aws-bucket'; // Replace with your S3 bucket name
    const fileName = selectedFile.name;
    const fileUri = selectedFile.uri;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileUri,
    };
    try {
      // const data = await s3.upload(params).promise();
      // console.log('File upload to S3 successful:', data);
      const apiUrl =
        'https://pdcj1mk57b.execute-api.ap-south-1.amazonaws.com/default/image-textract-node';

      const myHeaders = new Headers();
      myHeaders.append('x-api-key', 'SFNX0Pygxk3SvUyixJVSF6etM9ecWVha2l2QXB6z');
      myHeaders.append('Content-Type', selectedFile.type);

      if (!selectedFileUri) {
        console.error('No file selected.');
        setLoading(false);
        return;
      }

      const fileData = await RNFS.readFile(selectedFileUri, 'base64');

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: fileData,
        redirect: 'follow',
      };

      console.log('req', requestOptions.body);
      const apiResponse = await fetch(apiUrl, requestOptions);
      const result = await apiResponse.text();
      console.log(result);
      const parsedResult = JSON.parse(result);
      setParsedData(parsedResult);
      setLoading(false);
    } catch (error) {
      console.error('Error sending the request:', error);
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1,    
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title="Pick File" onPress={pickFile} />
      )}
      {parsedData && (
        <View>
          <Text>Data:</Text>
          <Text>{parsedData.data}</Text>
        </View>
      )}
    </View>
  );
};

export default MyComponent;
