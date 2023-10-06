import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import AWS from 'aws-sdk';
import axios from 'axios';
const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const uploadImageToLambda = async (data) => {
    // const imageBase64 = await base64Encode(imageUri)
    // console.log(imageBase64)
    const apiEndpoint = 'https://mctrq6yjq47hmxgeyvldxuwklm0vqiaq.lambda-url.ap-south-1.on.aws/';

    try {
      // Make sure to set appropriate headers and data format
      // console.log(data);
      const response = await axios.post(apiEndpoint, data);

      // Handle the response from the Lambda function
      console.log('Response from Lambda:', response.data);
    } catch (error) {
      console.log(error);
      console.error('Error sending image to Lambda:', error);
    }
  };
  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      setSelectedFile(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err;
      }
    }
  };

  const handleUploadFile = async () => {
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

    // Upload the file to S3
    try {
      const data = await s3.upload(params).promise();
      console.log('File upload successful:', data);
      uploadImageToLambda(data);
      // Now, use AWS Textract to extract text from the uploaded file
      // const textract = new AWS.Textract();
      // const textractParams = {
      //   Document: {
      //     S3Object: {
      //       Bucket: bucketName,
      //       Name: fileName,
      //     },
      //   },
      // };

      // const textractData = await textract.detectDocumentText(textractParams).promise();
      // console.log('Text extraction successful:', textractData);

      // // Extracted text is available in textractData
      // // Set the extracted text to the state
      // setExtractedText(textractData.Text || '');

      // alert('File uploaded and text extracted successfully');
    } catch (err) {
      console.error('Error:', err);
      alert('File upload and text extraction failed');
    }
  };

  return (
    <View>
      <Button style={{margin: 10}} title="Select File" onPress={handleSelectFile} />
      {selectedFile && <Text>Selected File: {selectedFile.name}</Text>}
      <Button  title="Upload File" onPress={handleUploadFile} />
      {extractedText && (
        <View>
          <Text>Extracted Text:</Text>
          <Text>{extractedText}</Text>
        </View>
      )}
    </View>
  );
};

export default ImageUploader;
