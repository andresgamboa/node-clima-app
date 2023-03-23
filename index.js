require('dotenv').config();

const { leerInput,
        pausa,
        inquirerMenu, 
        listarLugares} = require('./helpers/inquirer');
const { Busquedas } = require('./models/busquedas');


const main = async(  ) => {

    let opt;

    const busquedas = new Busquedas();


    do {

        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                
                //Mostrar mensaje
                const parametro = await leerInput('Ciudad: ');

                
                //buscar ciudad o lugar
                
                const lugares = await busquedas.ciudad(parametro);
                
                //seleccionar el lugar

                const idSeleccionado = await listarLugares(lugares);

                if( idSeleccionado === '0') continue;  // me ayuda a que no salga error al cancelar

                const lugarSeleccionado = lugares.find( l => l.id === idSeleccionado );

                //guardar en DB

                busquedas.agregarHistorial(lugarSeleccionado.nombre);

                //datos del clima

                const clima = await busquedas.climarLugar(lugarSeleccionado.lat, lugarSeleccionado.lng); 

                //mostrar resultados

                console.clear();
                console.log('\nInformacion de la ciudad\n'.green);
                console.log('Ciudad: '.green, lugarSeleccionado.nombre );
                console.log('Lat: '.green, lugarSeleccionado.lat);
                console.log('Lng: '.green, lugarSeleccionado.lng);
                console.log('Temperatura: '.green, clima.temp, '°C'.red);
                console.log('Temp Maxima: '.green, clima.max,'°C'.red);
                console.log('Temp Minima: '.green, clima.min,'°C'.red);
                console.log('Descripcion del Clima: '.green, clima.desc.blue);

            break;
        
            case 2:

            busquedas.historialCapitalizado.forEach( (lugar,i) => {

                const idx =  `${i + 1}.`.green;
                console.log(`${idx} ${lugar}`);

            });

            break;

        }

        await pausa();

        
    } while (opt !== 0);
    

}


main();