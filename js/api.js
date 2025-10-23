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
        
        // body内のpresigned_urlを取得
        if (data.body && data.body.presigned_url) {
            const imageContainer = document.getElementById('image-container');
            imageContainer.innerHTML = `<img src="${data.body.presigned_url}" alt="Generated Image" style="max-width: 100%; height: auto; margin-top: 1rem; border-radius: 4px;">`;
        }
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
        const res = data.body.content;
        
        if (res) {
            document.getElementById('result').innerHTML = `<pre>${res}</pre>`;
        } else {
            document.getElementById('result').innerHTML = `<p style="color: red;">ファイル内容が見つかりません</p>`;
        }
    } catch (error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">S3ファイル取得エラー: ${error.message}</p>`;
    }
}

async function uploadImageToS3() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        document.getElementById('result').innerHTML = '<p style="color: red;">画像を選択してください</p>';
        return;
    }
    
    const apiUrl = 'https://ty6xb7b681.execute-api.us-east-1.amazonaws.com/develop/test';
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1];
        
        const requestBody = {
            fileName: file.name,
            headers: {
                'content-type': file.type
            },
            data: base64Data
        };
        
        try {
            document.getElementById('result').innerHTML = '<p>アップロード中...</p>';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.sessid) {
                document.getElementById('sessid').value = data.sessid;
            }
            
            document.getElementById('result').innerHTML = `<p style="color: green;">アップロード成功!</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } catch (error) {
            document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
        }
    };
    
    reader.readAsDataURL(file);
}

async function playS3Audio() {
    const audioUrl = document.getElementById('audioUrl').value;
    const fileCount = parseInt(document.getElementById('fileCount').value);
    
    if (!audioUrl) {
        document.getElementById('result').innerHTML = '<p style="color: red;">音声URLを入力してください</p>';
        return;
    }
    
    const baseUrl = audioUrl.replace(/step\d+\.mp3$/, '');
    const audioContainer = document.getElementById('audio-container');
    let audioHtml = '';
    
    for (let i = 1; i <= fileCount; i++) {
        const url = `${baseUrl}step${i}.mp3`;
        audioHtml += `<div style="margin-bottom: 0.5rem;"><strong>Step ${i}:</strong><br><audio controls style="width: 100%;"><source src="${url}" type="audio/mpeg"></audio></div>`;
    }
    
    audioContainer.innerHTML = audioHtml;
}
