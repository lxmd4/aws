async function callApiGateway() {
    const apiUrl = 'https://13vhqp41dd.execute-api.us-east-1.amazonaws.com/test20250715-teamx';
    const jsonInput = document.getElementById('jsonInput').value;
    
    let requestBody = null;
    let method = 'GET';
    
    if (jsonInput.trim()) {
        try {
            requestBody = JSON.parse(jsonInput);
            method = 'POST';
        } catch (e) {
            document.getElementById('result').innerHTML = `<p style="color: red;">JSONエラー: ${e.message}</p>`;
            return;
        }
    }
    
    try {
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody ? JSON.stringify(requestBody) : null
        });
        
        const data = await response.json();
        document.getElementById('result').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
    }
}

async function fetchS3File() {
    try {
        const response = await fetch('https://or5a21r7o1.execute-api.us-east-1.amazonaws.com/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bucket: 'your-bucket', key: 'test.txt' })
        });
        const data = await response.json();
        const res = String(data.content);
        
        //if (data.content) {
            document.getElementById('result').innerHTML = '<pre>'+res+'</pre>';
        //} else {
        //    document.getElementById('result').innerHTML = `<p style="color: red;">ファイル内容が見つかりません</p>`;
        //}
    } catch (error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">S3ファイル取得エラー: ${error.message}</p>`;
    }
}