const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const User = require('../models/user');

const app = express();

app.get('/usuario', function (req, res) {


    let from = req.query.from || 0;
    from = Number(from);

    let limit = req.query.limit || 5;
    limit = Number(limit);
    // en el segundo parametro puedo incluir lo que se mostrara nada mas
    User.find({ state: true}, 'name email role state google img')
        .skip(from)
        .limit(limit)
        .exec( (err, users ) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.count({ state: true }, (err, count ) => {

                res.json({
                    ok: true,
                    users,
                    count
                })
            });

        });
});
  
app.post('/usuario', function (req, res) {

    let body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });


    user.save( (err, userDB) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
    /*  userDB.password = null; */
        res.json({
            ok: true,
            user: userDB
        });    
    });
});
  
app.put('/usuario/:id', function (req, res) {

    let id = req.params.id;
    let body = _.pick( req.body,  ['name', 'email', 'img', 'role', 'state'] );
    
    User.findByIdAndUpdate( id, body, {new: true, runValidators: true } ,(err, userDB) => {
        
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            user: userDB
        });
    });

});
  
app.delete('/usuario/:id', function (req, res) {
    
    let id = req.params.id;
//el codigo de abajo elimina para siempre un registro de la base de datos
/*     User.findByIdAndRemove(id, (err, deletedUser) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if( !deletedUser ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
           ok: true,
           user: deletedUser     
        });
    }); */

    let changeState = {
        state: false
    };

    User.findByIdAndUpdate(id, changeState, {new: true }, (err, deletedUser) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if( !deletedUser ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
           ok: true,
           user: deletedUser     
        });
    });

});

module.exports = app;