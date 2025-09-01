class Chat{
    constructor(){
        this.input = (document.getElementById('chatInput'));
        this.sendBtn = document.getElementById('sendButton');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.chatMessageArea = document.getElementById('chatMessages');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.isTyping = false;
        this.manager = new DataManager();
        this.admin = true;
        this.addingPQ = false;  
        this.pqStep = 0;        
        this.newPQ = {};        

        this.init();
    }

    init(){
        this.initSendBtnListener();
        this.initKeyInputListener();
    }

    initSendBtnListener(){
        this.sendBtn.addEventListener('click', ()=>{
            this.prepareMessage();
        })
    }

    initKeyInputListener(){
        if (this.input) {
            // Enter to send, Shift+Enter for new line
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.prepareMessage();
                } else if (e.key === 'Enter' && e.shiftKey) {
                    
                }
            });

            // Auto-resize textarea
            this.input.addEventListener('input', () => {
                this.autoResizeTextarea();
                this.updateSendButton();
            });

            // Reset placeholder on focus/blur
            this.input.addEventListener('focus', () => {
                if (this.input.placeholder === 'What are you looking for on campus?') {
                    this.input.placeholder = 'Type your message here...';
                }
            });
        }
    }

    prepareMessage(){
        if(this.isTyping) return;
        if(this.welcomeMessage){
            this.welcomeMessage.remove();
            this.welcomeMessage = null;
        }

        const value = this.input.value.trim();
        this.addUserMessage(value);
        this.updateSendButton();
        this.simulateBotResponse(value);
        this.scrollToBottom();
    }

    addUserMessage(message){
        this.chatMessageArea.append(this.createMessageElement(message, 'user'));
        this.input.value = "";
        this.autoResizeTextarea();
    }

    simulateBotResponse(question){
        this.showTypingIndicator();
        this.updateStatus('typing');
        
        // Simulate processing time
        const responseTime = Math.random() * 2000 + 1500; // 1.5-3.5 seconds
        
        setTimeout(() => {
            this.removeTypingIndicator();
            this.updateStatus('online');

            const response = this.generateBotResponse(question);
            // A promise is an object that represents the eventual result of an asynchronous operation
            if (response instanceof Promise) {
                // When a Promise resolves, .then() is called automatically, and the resolved data is passed
                // as an argument inside .then()
                response.then(resolved => this.addBotMessage(resolved));
            } else {
                this.addBotMessage(response);
            }
        }, responseTime);
    }

    addBotMessage(message){
        this.chatMessageArea.append(this.createMessageElement(message, 'bot'));
    }

    generateBotResponse(question) {
        if (this.admin) {  
            // Admin-only commands
            if (!this.addingPQ && question.startsWith("-pq add")) {
                this.addingPQ = true;
                this.pqStep = 1;
                this.newPQ = {};
                return "Please enter the question:";
            }

            if (this.addingPQ) {
                if (this.pqStep === 1) {
                    this.newPQ.question = question;
                    this.pqStep = 2;
                    return "Got it. Now, enter the category name:";
                }
                if (this.pqStep === 2) {
                    this.newPQ.category = question; // later map to Category.id
                    this.pqStep = 3;
                    return "Great. Finally, enter the answer:";
                }
                if (this.pqStep === 3) {
                    this.newPQ.answer = question;
                    this.pqStep = 0;
                    this.addingPQ = false;

                    // TODO: send to backend (Django) to save
                    this.manager.postRequest('/add_pq/', this.newPQ);

                    return "✅ Question added successfully to the database!";
                }
            }
        }

        return this.manager.postRequest('/fetch_ans/', { question })
            .then(data => {
                return data.answer;
            });
    }


    updateStatus(status){
        if (!this.statusIndicator) return;
        
        this.statusIndicator.className = `status-indicator ${status}`;
        
        switch(status) {
            case 'online':
                this.statusIndicator.textContent = '● Online';
                break;
            case 'typing':
                this.statusIndicator.textContent = '● Typing...';
                break;
            case 'offline':
                this.statusIndicator.textContent = '● Offline';
                break;
        }
    }

    showTypingIndicator() {
        this.removeTypingIndicator(); // Remove any existing indicator
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-content';
        
        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDots.appendChild(dot);
        }
        
        typingContent.appendChild(typingDots);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);
        
        this.chatMessageArea.appendChild(typingDiv);
        this.scrollToBottom();
        
        this.isTyping = true;
    }

    removeTypingIndicator() {
        const existing = document.getElementById('typingIndicator');
        if (existing) {
            existing.remove();
        }
        this.isTyping = false;
    }

    createMessageElement(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? 'U' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = this.formatMessage(content);
        
        messageDiv.appendChild(avatar);
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        contentWrapper.appendChild(messageContent);
        
        if(type != "bot"){
            const messageTime = document.createElement('div');
            messageTime.className = 'message-time';
            messageTime.textContent = this.formatTime(new Date());
            contentWrapper.appendChild(messageTime);
        }

        messageDiv.appendChild(contentWrapper);
        
        // Animate message appearance
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
        
        return messageDiv;
    }

    formatMessage(content) {
        // Basic formatting for bot responses
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/\n/g, '<br>') // Line breaks
            .replace(/•/g, '•'); // Bullet points
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    scrollToBottom() {
        this.chatMessageArea.scrollTop = this.chatMessageArea.scrollHeight;
    }

    autoResizeTextarea() {
        if (this.input) {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 200) + 'px';
        }
    }

    updateSendButton(){
        if(this.sendBtn && this.input){
            const hasContent = this.input.value.trim().length > 0;
            this.sendBtn.disabled = !hasContent || this.isTyping;
        }
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    window.chat = new Chat();
})