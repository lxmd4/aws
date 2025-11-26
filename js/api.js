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
            if (data.url) {
                document.getElementById('s3ImageUrl').value = data.url;
            }
            
            document.getElementById('result').innerHTML = `<p style="color: green;">アップロード成功!</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } catch (error) {
            document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
        }
    };
    
    reader.readAsDataURL(file);
}

async function imgRecognition() {
    const sessionId = document.getElementById('sessid').value;
    const s3ImageUrl = document.getElementById('s3ImageUrl').value;
    
    const apiUrl = 'https://v7mxxdc3r5.execute-api.us-east-1.amazonaws.com/develop/test';    
    const requestBody = {
        'sessionId': sessionId,
        's3ImageUrl': s3ImageUrl
    };
        
    try {
        document.getElementById('result').innerHTML = '<p>解析中...</p>';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        document.getElementById('result').innerHTML = `<p style="color: green;">解析完了!</p>`;
    } catch (error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
    }
}

async function genelateRecipe() {
    const sessionId = document.getElementById('sessid').value;
    
    const apiUrl = 'https://g15c8jena9.execute-api.us-east-1.amazonaws.com/develop/test';    
    const requestBody = {
        'sessionId': sessionId
    };
        
    try {
        document.getElementById('result').innerHTML = '<p>生成中...</p>';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
            
            if (data.step_count) {
                fileCount = data.step_count;
            }
            if (data.audio_urls) {
                audioUrl = data.audio_urls;
            }

        document.getElementById('result').innerHTML = `<p style="color: green;">生成完了!</p>`;
    } catch (error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
    }
}

let currentAudioIndex = 0;
let audioFiles = [];
let fileCount;
let audioUrl;

async function playS3Audio() {
    if (!audioUrl) {
        document.getElementById('result').innerHTML = '<p style="color: red;">音声URLを入力してください</p>';
        return;
    }
    
    const baseUrl = audioUrl.replace(/step\d+\.mp3$/, '');
    audioFiles = [];
    
    for (let i = 1; i <= fileCount; i++) {
        audioFiles.push(`${baseUrl}step${i}.mp3`);
    }
    
    currentAudioIndex = 0;
    loadAudio();
}

function loadAudio() {
    const audioContainer = document.getElementById('audio-container');
    audioContainer.innerHTML = `
        <div style="margin-bottom: 0.5rem;"><strong>Step ${currentAudioIndex + 1} / ${audioFiles.length}</strong></div>
        <audio id="audioPlayer" controls style="width: 100%;"><source src="${audioFiles[currentAudioIndex]}" type="audio/mpeg"></audio>
        <div style="margin-top: 0.5rem;">
            <button class="button is-small" onclick="prevAudio()" ${currentAudioIndex === 0 ? 'disabled' : ''}>前へ</button>
            <button class="button is-small is-primary" onclick="document.getElementById('audioPlayer').play()">再生</button>
            <button class="button is-small" onclick="nextAudio()" ${currentAudioIndex === audioFiles.length - 1 ? 'disabled' : ''}>次へ</button>
        </div>
    `;
}

function prevAudio() {
    if (currentAudioIndex > 0) {
        currentAudioIndex--;
        loadAudio();
    }
}

function nextAudio() {
    if (currentAudioIndex < audioFiles.length - 1) {
        currentAudioIndex++;
        loadAudio();
    }
}
