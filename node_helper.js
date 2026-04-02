const NodeHelper = require('node_helper');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = NodeHelper.create({
    start: function() {
        console.log('MMM-Tasks helper started');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'FETCH_TASKS') {
            this.fetchTasks(payload);
        }
    },

    fetchTasks: function(config) {
        const self = this;
        const scriptPath = path.join(__dirname, 'fetch_tasks.py');
        const tokenPath = config.tokenPath || '/home/pi/MagicMirror/config/token.json';
        const dateFormat = config.dateFormat || 'MM/DD';

        exec(
            'python3 ' + JSON.stringify(scriptPath) +
            ' --token ' + JSON.stringify(tokenPath) +
            ' --date-format ' + JSON.stringify(dateFormat),
            (error, stdout, stderr) => {
                if (error) {
                    console.error('MMM-Tasks error:', stderr);
                    return;
                }
                try {
                    const dataPath = path.join(__dirname, 'tasks_data.json');
                    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                    self.sendSocketNotification('TASKS_DATA', data);
                } catch(e) {
                    console.error('MMM-Tasks parse error:', e);
                }
            }
        );
    }
});
