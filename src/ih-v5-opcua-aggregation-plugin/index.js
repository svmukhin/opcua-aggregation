const util = require('util');

const app = require('./app'); // Модуль, который будет содержать основной цикл плагина

(async () => {

  let plugin;
  try {
    // Получить основные параметры, переданные при запуске
    const opt = getOptFromArgs();

     // Объект plugin предоставляет доступ к API ядра
    const pluginapi = opt && opt.pluginapi ? opt.pluginapi : 'ih-plugin-api';
    plugin = require(pluginapi+'/index.js')();
    plugin.log('Плагин стартовал.');

    // Получить параметры плагина
    plugin.params.data = await plugin.params.get();
    plugin.log('Получены параметры: '+ util.inspect(plugin.params.data));

    // Получить каналы - если плагин их использует
    plugin.channels.data = await plugin.channels.get();
    plugin.log('Получены каналы '+util.inspect(plugin.params.data));

    app(plugin); // Запустить модуль
                 // Либо разместить код основного цикла прямо здесь
  } catch (err) {
    plugin.exit(8, `Error: ${util.inspect(err)}`);
  }
})();

function getOptFromArgs() {
  let opt;
  try {
    opt = JSON.parse(process.argv[2]); //
  } catch (e) {
    opt = {};
  }
  return opt;
}