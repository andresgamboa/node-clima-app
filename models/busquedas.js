const fs = require('fs');  

const axios = require('axios');



class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        //TO DO: leer DB si existe DB = base de datos 


        this.leerDB();

    }

    // get paramsLocationIQ(){  //lugar no existe en este get, entonces no me hace la busqueda de la ciudad
    //     return {
    //         'key': 'pk.1d429c4a63241b996e1468784d01d442',
    //         'q': `${lugar}`,
    //         'format': 'json',
    //         'limit': 5,
    //         'lenguage': 'es' 
    //     }
    // }

    get historialCapitalizado () {

        return this.historial.map( lugar => {   //con map porque voy a cambiar mis datos del arreglo
            
            let palabras = lugar.split(' '); //en palabras, almaceno el el arreglo modificado, usando la propiedad split para separar las palabras por un ' ' espacio, para asi tomar cada palaabra separada por espacio
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) ); //Hago la capitalizacion de la primera letra de cada palabra

            return palabras.join(' ');  //con join, uno las palabras que habia separado por un espacio ' '
        });
    }

    get paramOpenWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }

    }

    async ciudad ( lugar = '' ){

        try {
            //peticion HTTP
            const instance = axios.create({
                baseURL: `https://us1.locationiq.com/v1/search`,
                params: {
                    'key': process.env.LOCATIONIQ_KEY,
                    'q': lugar,
                    'format': 'json',
                    'limit': 5,
                    'lenguage': 'es' 
                }       
            });

            const resp = await instance.get();

            return resp.data.map( lugar => ({       //al colocar parentesis y llaves, digo implicitamente que quiero que me retorne un objeto 
                id: lugar.place_id,
                nombre: lugar.display_name,
                lat: lugar.lat,
                lng: lugar.lon
                })
            );

        } catch (error) {
            return [];
        }

    }

    async climarLugar (lat, lon ){

        try {
            
            const instance = axios.create({

                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: { ...this.paramOpenWeather , lat, lon}  //la latitud y long no van dentro del get, por ello desestructuro el objeto y añado los parametros faltantes que llegan como parametro acá
            });

            const resp = await instance.get();

            const {weather, main} = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial ( lugar = '' ) {

        //TODO: prevenir duplicados

        if( this.historial.includes(lugar.toLocaleLowerCase()) ){ //validacion para que no repita los mismos lugares
            return;
        }

        this.historial = this.historial.splice(0,5); //limito para que el arreglo donde se almacena las busquedas, sea de maximo 6

        this.historial.unshift(lugar.toLocaleLowerCase()); //unshift para que me los agrege al inicio y se guarden en forma de cascada, con push los guardo al final, por ende no me sirve

        //grabar en DB

        this.guardarDB() 
    }

    guardarDB(){

        const payLoad = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify( payLoad ));

    }

    leerDB(){

        if( !fs.existsSync(this.dbPath) ){

        return;
        }

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial;
    }

}



module.exports = {
    Busquedas
}