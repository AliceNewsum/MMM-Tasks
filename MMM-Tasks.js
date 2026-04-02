Module.register('MMM-Tasks', {
    defaults: {
        tokenPath: '/home/pi/MagicMirror/config/token.json',
        header: 'TO DO',
        maxTasks: 20,
        dateFormat: 'MM/DD',
        updateInterval: 10 * 60 * 1000
    },

    start: function() {
        this.tasks = { active: [], backlog: [] };
        this.tickerIndex = 0;
        this.sendSocketNotification('FETCH_TASKS', this.config);
        setInterval(() => {
            this.sendSocketNotification('FETCH_TASKS', this.config);
        }, this.config.updateInterval);
        setInterval(() => {
            this.tickerIndex = (this.tickerIndex + 1) % Math.max(1, this.tasks.active.length);
            this.updateDom(500);
        }, 4000);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'TASKS_DATA') {
            this.tasks = payload;
            this.tickerIndex = 0;
            this.updateDom();
        }
    },

    getDom: function() {
        const wrapper = document.createElement('div');
        wrapper.className = 'mmm-tasks';

        const listHeader = document.createElement('div');
        listHeader.className = 'tasks-header';
        listHeader.textContent = this.config.header;
        wrapper.appendChild(listHeader);

        if (this.tasks.backlog.length === 0 && this.tasks.active.length === 0) {
            const none = document.createElement('div');
            none.className = 'tasks-none';
            none.textContent = 'No tasks';
            wrapper.appendChild(none);
        } else {
            const allTasks = [...this.tasks.active, ...this.tasks.backlog];
            const limited = allTasks.slice(0, this.config.maxTasks);
            limited.forEach(task => {
                const row = document.createElement('div');
                row.className = 'task-row' + (task.overdue ? ' overdue' : '');
                const bullet = document.createElement('span');
                bullet.className = 'task-bullet';
                bullet.textContent = '\u2022';
                const title = document.createElement('span');
                title.className = 'task-title';
                title.textContent = task.title;
                const due = document.createElement('span');
                due.className = 'task-due';
                due.textContent = task.due ? task.due : '';
                row.appendChild(bullet);
                row.appendChild(title);
                row.appendChild(due);
                wrapper.appendChild(row);
            });
        }

        return wrapper;
    },

    getStyles: function() {
        return ['MMM-Tasks.css'];
    }
});
