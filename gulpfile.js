var gulp = require('gulp'),
nodemon = require('gulp-nodemon');

gulp.task('default', function(){
    nodemon({
        script: 'server.js',
        ext: 'js',
        env: {
            PORT: 8001,
            env : false,
            DB_CONNECTION_STRING : "mongodb://localhost:27017/chat_app"
        },
        ignore: ['./node_modules/**']
    })
    .on('restart', function(){
        console.log('Restarted')
    })
});