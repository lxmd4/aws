let currentAudioIndex = 0;
let audioFiles;
let fileCount;
let audioUrl;
let s3ImageUrls = [];

function showPopup(message, showButton = false) {
    const popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px 40px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.3);z-index:9999;font-size:18px;text-align:center';
    popup.innerHTML = `<div>${message}</div>`;
    if (showButton) {
        const btn = document.createElement('button');
        btn.textContent = 'OK';
        btn.style.cssText = 'margin-top:15px;padding:8px 30px;background:#3273dc;color:white;border:none;border-radius:4px;cursor:pointer;font-size:16px';
        btn.onclick = () => closePopup(popup);
        popup.appendChild(btn);
    }
    document.body.appendChild(popup);
    return popup;
}

function closePopup(popup) {
    if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup);
    }
}

async function uploadImageToS3() {
    const fileInput = document.getElementById('imageFile');
    const files = fileInput.files;
    
    if (files.length === 0) {
        document.getElementById('result').innerHTML = '<p style="color: red;">画像を選択してください</p>';
        return;
    }
    
    const popup = showPopup('処理中');
    const apiUrl = 'https://ty6xb7b681.execute-api.us-east-1.amazonaws.com/develop/test';
    const results = [];
    
    try {
        document.getElementById('result').innerHTML = '<p>アップロード中...</p>';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1]);
                reader.readAsDataURL(file);
            });

            sessid = document.getElementById('sessid').value
            if(!sessid){
                sessid=''
            }
            
            const requestBody = {
                fileName: file.name,
                headers: {
                    'content-type': file.type
                },
                data: base64Data,
                sessid: document.getElementById('sessid').value
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            results.push(data);
            
            if (data.sessid) {
                document.getElementById('sessid').value = data.sessid;
            }
            if (data.url) {
                s3ImageUrls.push(data.url);
            }
        }
        
        document.getElementById('result').innerHTML = `<p style="color: green;">アップロード成功! (${files.length}件)</p><pre>${JSON.stringify(results, null, 2)}</pre>`;
        closePopup(popup);
        showPopup('完了', true);
    } catch (error) {
        closePopup(popup);
        document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
    }
}

async function imgRecognition() {
    const sessionId = document.getElementById('sessid').value;
    
    const popup = showPopup('処理中');
    const apiUrl = 'https://v7mxxdc3r5.execute-api.us-east-1.amazonaws.com/develop/test';
    const results = [];
    const allIngredients = [];
        
    try {
        document.getElementById('result').innerHTML = '<p>解析中...</p>';
        
        for (let i = 0; i < s3ImageUrls.length; i++) {
            const requestBody = {
                'sessionId': sessionId,
                's3ImageUrl': s3ImageUrls[i]
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            results.push(body);
            
            if (body.ingredients) {
                allIngredients.push(...body.ingredients);
            }
        }
        
        document.getElementById('ingredients-result').innerHTML = `<p><strong>検出された食材:</strong></p><ul>${allIngredients.map(item => `<li>${item}</li>`).join('')}</ul>`;
        document.getElementById('result').innerHTML = `<p style="color: green;">解析完了! (${s3ImageUrls.length}件)</p><pre>${JSON.stringify(results, null, 2)}</pre>`;
        closePopup(popup);
        showPopup('完了', true);
    } catch (error) {
        closePopup(popup);
        document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
    }
}

async function genelateRecipe() {
    const sessionId = document.getElementById('sessid').value;
    
    const popup = showPopup('処理中');
    const apiUrl = 'https://g15c8jena9.execute-api.us-east-1.amazonaws.com/develop/test';    
    const requestBody = {
        'session_id': sessionId
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
        const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            
        if (body.step_count) {
            fileCount = body.step_count;
        }
        if (body.audio_urls) {
            audioUrl = body.audio_urls;
        }
        if (body.image_url) {
            imageUrl = body.image_url;
        }
        
        if (body.recipe_url) {
            const recipeResponse = await fetch(body.recipe_url);
            const recipeText = await recipeResponse.text();
            document.getElementById('recipe-result').innerHTML = `<p><strong>レシピ:</strong></p><div style="background: #f5f5f5; padding: 1rem; border-radius: 4px;">${recipeText}</div>`;
        }
        
        if (body.image_url) {
            document.getElementById('recipe-image').innerHTML = `<img src="${body.image_url}" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" alt="レシピ画像">`;
        }

        document.getElementById('result').innerHTML = `<p style="color: green;">生成完了!</p><pre>${JSON.stringify(body, null, 2)}</pre>`;
        closePopup(popup);
        showPopup('完了', true);
    } catch (error) {
        closePopup(popup);
        document.getElementById('result').innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
    }
}

async function playS3Audio() {
    audioFiles = audioUrl;
    
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
