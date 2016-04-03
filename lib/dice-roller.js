var util = require('util');
var tokenizer = require('string-tokenizer');
var _ = require('lodash');

function DiceRoller() {
}

DiceRoller.prototype.parseMessage = function parseMessage(message) {
    // expected formats:
    // <none>
    // (\d+)d(\d+)
    // @mention1 @mention2 ... @mentionN
    var dice = [];

    if (!!!message || message.trim().length === 0) {
        dice.push(new Die());
        return dice;
    }

    var tokens = tokenizer(message)
        .token('dice', /\d+d\d+/)
        .token('word', /[@\w-_]+/)
        .resolve();

    var diceTokens = tokens.dice;
    var wordTokens = tokens.word;

    // handle dice tokens
    if (diceTokens !== null) {
        if (util.isString(diceTokens)) {
            diceTokens = [diceTokens];
        }

        if (util.isArray(diceTokens)) {
            for (var i = 0, l = diceTokens.length; i < l; i++) {
                dice = dice.concat(Die.prototype.diceFromString(diceTokens[i]));
            }
        }
    }

    // handle word tokens
    if (wordTokens !== null) {
        if (util.isString(wordTokens)) {
            wordTokens = [wordTokens];
        }

        if (util.isArray(wordTokens)) {
            dice.push(new Die(wordTokens));
        }
    }

    return dice;
};

DiceRoller.prototype.rollDice = function rollDice(message) {
    var dice = DiceRoller.prototype.parseMessage(message);
    var rolls = dice.reduce(function(arr, val) { arr.push(val.roll()); return arr; }, []);
    var result = rolls.reduce(function(obj, val) {
        switch (typeof (val)) {
            case 'number':
                obj.dice += val;
                break;
            case 'string':
                obj.str = ((obj.str || '') + ' ' + val).trim();
                break;
        }

        return obj;
    }, { 'str': null, 'dice': null });

    return {
        dice: dice,
        rolls: rolls,
        result: result
    };
};

function Die(faces) {
    if (!!!faces || !util.isArray(faces)) {
        faces = Die.prototype.defaultFaces;
    }
    
    faces = _.uniq(faces);

    if (faces.length < 2) {
        throw 'Die requires at least 2 faces.';
    }

    this.faces = faces;
}

Die.prototype.defaultFaces = [1, 2, 3, 4, 5, 6];

Die.prototype.roll = function roll() {
    var faceIndex = Math.floor(Math.random() * this.faces.length);
    return this.faces[faceIndex];
};

Die.prototype.diceStringRegex = /(\d+)d(\d+)/;

Die.prototype.diceFromString = function diceFromString(str) {
    var dice = [];
    var diceMatch = Die.prototype.diceStringRegex.exec(str);

    if (diceMatch !== null) {
        var diceCount = Number.parseInt(diceMatch[1], 10);
        var diceFacesCount = Number.parseInt(diceMatch[2], 10);

        var diceFaces = [];
        for (var face = 1; face <= diceFacesCount; face++) {
            diceFaces.push(face);
        }

        for (var i = 1; i <= diceCount; i++) {
            dice.push(new Die(diceFaces));
        }
    }

    return dice;
};

module.exports = DiceRoller;