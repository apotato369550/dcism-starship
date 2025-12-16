// Chat UI Management
export class ChatUI {
    constructor() {
        this.chatBox = document.getElementById('chat-box');
        this.chatMsgs = document.getElementById('chat-msgs');
        this.chatInput = document.getElementById('chat-input');
    }

    addMessage(user, msg, color) {
        const div = document.createElement('div');
        div.style.marginBottom = '5px';
        div.innerHTML = `<b style="color:${color}">${user}:</b> ${msg}`;
        this.chatMsgs.appendChild(div);
        this.chatMsgs.scrollTop = this.chatMsgs.scrollHeight;
    }

    onSendMessage(callback) {
        this.chatInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                callback(this.chatInput.value);
                this.chatInput.value = '';
            }
        });
    }
}
