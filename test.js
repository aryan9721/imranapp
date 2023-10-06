        console.log(JSON.stringify(event))
        const decodedData = Buffer.from(event.body, "base64").toString();
        console.log('Decoded Image Data Length:', decodedData.length);
        console.log(decodedData)
        const command = new AnalyzeDocumentCommand({Document: {Bytes: Buffer.from(decodedData, "base64")},
        FeatureTypes: ["TABLES", "FORMS"]});
        
        const response = await client.send(command);
        const extractedText = extractTextFromResponse(response);

        return {
            statusCode: 200,
            body: JSON.stringify({data: extractedText})
        }