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