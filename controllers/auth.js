const express = require('express');
//const { Response } = require('express');
const Usuario = require('../models/Usuario');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { generarToken } = require('../helpers/jwt');

const crearUsuario = async (req, res = express.response) =>{
    //console.log(req);
    console.log(req.body);
    const {name, email, password} = req.body;
    //const errores = validationResult(req);
    //console.log(errores);
    try {
        

        let usuario = await Usuario.findOne({email});
        console.log(usuario);

        if(usuario){
            return res.status(400).json({
                ok:false,
                msg: 'El usuario ya existe'
            });
        }
        usuario = new Usuario(req.body);
        //encriptamos el password del usuario creado
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password,salt);

        //generamos token para el acceso a la aplicacion
        const token = await generarToken(usuario.id, usuario.name, salt)
        console.log(token);

        await usuario.save();
        /*  if(Password.length < 8) {
        return res.status(404).json({error:'La contraseña debe tener al menos 8 caracteres'});
        }  */

        res.status(200).json({
            Message: "Usuario creado correctamente",
            //user: req.body,
            name, email, token 
        });
            
    } catch (error) {
        res.status(500).json({
            "message": 'No pudimos crear el usuario, contacte al administrador',
            "error": error
        })
    }
    
}

const loginUsuario = async (req, res) =>{

    const { email, password} = req.body;

    try {
        const usuario = await Usuario.findOne({email});

        if(!usuario){
            return res.status(400).json({
                ok:false,
                msg: 'Usuario o contraseña incorrectos'
            });
        }

        const validarPassword = bcrypt.compareSync(password, usuario.password);

        if(!validarPassword){
            return res.status(400).json({
                ok:false,
                msg: 'Usuario o contraseña incorrectos'
            });
        }
        //generamos el token para el acceso a la aplicacion
        const token = await generarToken(usuario.id, usuario.name);
        console.log(token);

        res.status(200).json({
            Message: "Bienvenido a nuestra Api - login",
            token
        });

    } catch (error) {
        res.status(400).json({
            "message": 'No pudimos loguear el usuario, contacte al administrador',
            "error": error
        })
    }

    
}

const renovarToken = async (req, res = express.response) =>{

    const uid = req.uid;
    const name = req.name;

    const token = await generarToken(uid, name);
    console.log(token);

    res.json({
        Message: "Renovamos tu permiso con este token",
        token
    });
}

module.exports = {
    crearUsuario,
    loginUsuario,
    renovarToken
}