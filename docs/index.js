const NIXON_JUMP_FORCE = 300;
const NIXON_RUN_SPEED = 100;
const NIXON_KICK_DISTANCE = 75;
const TROUT_JUMP_FORCE = 175
const TROUT_MOVE_SPEED = 75;
const SLIME_MOVE_SPEED = 50;

const NIXON_STATE = {
    health: 1,
};

kaboom({
    global: true,
    fullscreen: true,
    scale: 2
});

// AUDIO
loadSound("aroo", "./aroo.m4a");
loadSound("richard", "./richard.m4a");
loadSound("title", "./title.m4a");
loadSound("battle", "./battle.m4a");
loadSound("explosion", "./explosion.m4a");
loadSound("trout", "./trout.m4a");


// SPRITES
loadSprite("trout", "./trout.png", {
    sliceY: 2,
});

// TEMP
loadSprite("slime", "./slime.png", {
    sliceX: 2,
    sliceY: 2,
    anims: {
        idle: {
            from: 0,
            to: 1,
        },
        run: {
            from: 2,
            to: 3,
        }
    }
});

loadSprite("nixon", "./nixon.png", {
    sliceX: 3,
    sliceY: 3,
    anims: {
        idle: {
            from: 0,
            to: 1
        },
        run: {
            from: 2,
            to: 4
        },
        kick: {
            from: 6,
            to: 6,
        }
    }
})


loadSprite("cave", "./cave.png");
loadSprite("cobblestone", "./cobblestone.png");
loadSprite("dirt", "./dirt.png");
loadSprite("cave_bg", "./cave_bg.png");
loadSprite("classified", "./classified.png");
loadSprite("explosion", "./explosion.png", {
    sliceX: 2,
    sliceY: 2,
    anims: {
        explode: {
            from: 0,
            to: 3
        }
    }
});

// GAME

// reusable functions

function createNixon() {
    return add([
        sprite("nixon"),
        pos(8, 8),
        layer("objects"),
        body(),
        "NIXON",
        "debug",
    ]);
}

function sceneSetup(nixon) {
    // background
    add([
        sprite("cave_bg"),
        scale(width() / 240, height() / 240),
        layer("bg"),
    ]);

    const battleMusic = play("battle", { speed: 1.5 });

    // display score
    const score = add([
        text("0", 16),
        layer("ui"),
        pos(9, 9),
        {
            value: 0,
        },
    ]);

    on("destroy", "enemy", () => {
        const detuneAmount = rand(-500, 225);
        addScore(score);
        play("explosion", { detune: detuneAmount });
    });

    nixon.collides("enemy", (enemy) => {
        if (NIXON_STATE.health > 1) {
            NIXON_STATE.health--;
        } else {
            battleMusic.stop();
            go("gameOver", { enemy, score });
        }
    });

    nixon.collides("goal", () => {
        battleMusic.stop();
        go("victory", score);
    });
}


function handleNixon(nixon) {

    // Make the camera follow Richard
    // nixon.action(() => {
    //     const newPos = vec2(nixon.pos.x, height() / 2)
    //     camPos(newPos);
    // });

    nixon.play("idle");

    keyPress("space", () => {
        nixon.play("kick");

        every("enemy", (enemy) => {
            // If the enemy is within 1 unit of Richard, punch it
            if (nixon.pos.dist(enemy.pos) < NIXON_KICK_DISTANCE) {
                destroy(enemy)
                const explosion = add([
                    sprite("explosion"),
                    pos(enemy.pos),
                    layer("objects")
                ]);
                explosion.play("explode");
                wait(1, () => {
                    destroy(explosion);
                });
            }
        })
    });

    keyPress("up", () => {
        if (nixon.grounded()) {
            nixon.jump(NIXON_JUMP_FORCE);
        }
    });

    keyDown("right", () => {
        // nixon.flipX(1)
        nixon.move(NIXON_RUN_SPEED, 0);
    });

    keyDown(["left", "right"], () => {
        if (nixon.grounded() && nixon.curAnim() !== "run") {
            nixon.play("run");
        }
    });

    keyRelease(["left", "right", "space"], () => {
        if (!keyIsDown("right") && !keyIsDown("left")) {
            nixon.play("idle");
        }
    });

    keyDown("left", () => {
        // nixon.flipX(-1);
        nixon.move(-NIXON_RUN_SPEED, 0);
    });

    nixon.on("grounded", () => {
        if (nixon.curAnim() === "jump") {
            nixon.play("idle");
        }
    })
}

function handleTroutSpawner(troutSpawner) {
    loop(2, () => {
        const trout = add([
            sprite("trout"),
            pos(troutSpawner.pos.x, troutSpawner.pos.y),
            body(),
            layer("objects"),
            "enemy",
            "TROUT"
        ]);

        // TODO: Performance?
        trout.action(() => handleTrout(trout));
    });
}

function handleTrout(trout) {
    const volumeAmount = rand(0.25, 1.0);
    const detuneAmount = rand(-500, 500);
    // const direction = rand(1, 10) % 2 === 0 ? 1 : -1;
    // Jump over and over, and move while in the air
    if (trout.grounded()) {
        play("trout", { volume: volumeAmount, detune: detuneAmount });
        trout.jump(TROUT_JUMP_FORCE);
    } else {
        // trout.move(TROUT_MOVE_SPEED * direction);
        trout.move(-TROUT_MOVE_SPEED);
    }
}


function addScore(score) {
    score.value += 100;
    score.text = score.value;
}

scene("menu", () => {

    keyPress("space", () => {
        go("title");
    })

    add([
        sprite("classified"),
        scale(width() / 240, height() / 240),
    ]);

    add([
        text(`
           PRESS SPACE TO OPEN

           CLASSIFIED NIXON EVIDENCE
        `, 14),
        pos((width() / 2) - 50, (height() / 2) + 75),
        origin("center"),
    ]);

    add([])
});

scene("title", () => {
    layers([
        "bg",
        "ui"
    ]);

    const titleMusic = play("title");


    add([
        sprite("cave_bg"),
        scale(width() / 240, height() / 240),
        layer("bg"),
    ]);

    add([
        text(`
        SUPER RICHARD NIXON QUEST:

        PROLOGUE
        
        The Battle of a Thousand Trout

        Press SPACEBAR to continue
        `, 14),
        origin("center"),
        pos(width() / 2, height() / 2),
        layer("ui")
    ]);

    keyPress(["space", "left", "right", "up"], () => {
        titleMusic.stop();
        // go("1kTrout");
        go("level1");
    });
});

scene("level1", () => {
    layers([
        "bg",
        "objects",
        "ui",
    ]);

    const nixon = createNixon();
    sceneSetup(nixon);
    handleNixon(nixon);

    // const slime = add([
    //     sprite("slime"),
    //     pos(550, 50),
    //     body(),
    //     layer("objects")
    // ]);

    // keyPress(["right", "left"], () => {
    //     slime.play("run");
    // });

    // keyDown("right", () => {
    //     slime.move(-NIXON_RUN_SPEED, 0);
    // });
    // keyDown("left", () => {
    //     slime.move(NIXON_RUN_SPEED, 0);
    // });


    const map = addLevel([
        "                                                 o",
        "               ...                               o",
        "    s                          s                 o",
        "   ===                        =========          o",
        "                   t                             o",
        "                  ===                            o",
        "                                 t               o",
        "                              ......             o",
        "                                                 o",
        "                 .....                           o",
        "                                                 o",
        "N      ...                                       o",
        "==========.......=====..=========================o",
    ],
        {
            width: 30,
            height: 30,
            pos: vec2(0, 0),
            "=": [sprite("dirt"), scale(1.0), solid(), layer("objects")],
            ".": [sprite("cobblestone"), scale(1.0), solid(), layer("objects")],
            "o": [sprite("dirt"), scale(1.0), solid(), layer("objects"), "goal"],
            "t": [layer("objects"), "troutSpawner"],
            "s": [sprite("slime"), body(), layer("objects"), "enemy", "SLIME", "debug", { direction: 1, prevPos: {} }],
            "N": ["NIXON_START"], // TODO: Use this to set Nixon start position
        });

    // debug
    every("debug", (debugObject) => {
        const debugRect = add([
            rect(debugObject.width, debugObject.height),
            color(1, 1, 1),
            pos(debugObject.pos.x, debugObject.pos.y),
            layer("bg")
        ]);

        debugObject.action(() => {
            debugRect.pos = debugObject.pos;
        });
    });


    every("SLIME", (slime) => {
        slime.on("move", (movedSlime) => {
            movedSlime.prevPos = movedSlime.pos;
        });
        loop(0.5, () => {
            // const randomNumber = Math.floor(rand(1, 10));
            // slime.direction = randomNumber % 2 === 0 ? 1 : -1;
            if (slime.prevPos.x === slime.pos.x) {
                slime.direction = -slime.direction;
            }
        })
    });

    action("SLIME", (slime) => {
        if (slime.grounded()) {
            slime.move(SLIME_MOVE_SPEED * slime.direction, 0);
        }
    })

    every("troutSpawner", handleTroutSpawner);
});

scene("victory", (score) => {
    layers([
        "bg",
        "ui"
    ]);

    // background
    add([
        sprite("cave_bg"),
        scale(width() / 240, height() / 240),
        layer("bg"),
    ]);

    add([
        text(`
        YOU WIN!

        CONGLATURATION! YOU HAVE DONE THE ONLY THING

        THAT CAN EVEN LOOSELY BE DESCRIBED AS BEATING

        THIS "GAME"!

        YOUR SCORE WAS ${score.value} TROUTBUCKS

        PRESS SPACE TO PLAY AGAIN IF YOU WANT
        `, 10),
        pos(width() / 2, height() / 2),
        origin("center"),
        layer("ui")
    ]);

    keyPress("space", () => {
        go("1kTrout");
    })
});

scene("gameOver", ({ enemy, score }) => {
    layers([
        "bg",
        "ui",
    ]);

    let deathSound;

    if (Math.floor(Math.random() * 10) % 2 === 0) {
        deathSound = play("aroo", { speed: 1.0 });
    } else {
        deathSound = play("richard", { speed: 1.0 });
    }

    // background image
    add([
        sprite("cave_bg"),
        scale(width() / 240, height() / 240),
        layer("bg"),
    ]);

    add([
        text(`
        Impeached by: ${enemy ? enemy._tags[1] || "unknown" : "unknown"}

        Your score: ${score.value}
        
        PRESS SPACE TO PLAY AGAIN
        `, 14),
        pos(width() / 2, height() / 2),
        origin("center"),
        layer("ui")
    ]);
    keyPress("space", () => {
        deathSound.stop();
        go("1kTrout");
    });
});


scene("1kTrout", () => {

    layers([
        "bg",
        "objects",
        "ui",
    ]);

    const slime = add([
        sprite("slime"),
        pos(20, 8),
        layer("objects"),
        body()
    ]);

    slime.play("idle");

    keyPress("shift", () => {
        slime.jump(NIXON_JUMP_FORCE);
    });

    keyPress(["d", "a"], () => {
        slime.play("run");
    });

    keyDown("d", () => {
        slime.move(NIXON_RUN_SPEED);
    });

    keyDown("a", () => {
        slime.move(-NIXON_RUN_SPEED);
    });

    const nixon = createNixon();

    sceneSetup(nixon);

    add(
        [
            sprite("trout"),
            pos(550, 110),
            origin("center"),
            body(),
            layer("objects"),
            "enemy",
            "TROUT", // Second tag is used on Game Over screen to tell you what killed you
        ]
    );

    add(
        [
            sprite("trout"),
            pos(400, 200),
            origin("center"),
            body(),
            layer("objects"),
            "enemy",
            "TROUT" // Second tag is used on Game Over screen to tell you what killed you
        ]
    );

    add(
        [
            sprite("trout"),
            pos(250, 150),
            origin("center"),
            body(),
            layer("objects"),
            "enemy",
            "TROUT" // Second tag is used on Game Over screen to tell you what killed you
        ]
    );

    loop(1, () => {
        const randX = rand(100, 500);
        const randY = rand(10, 100);
        const trout = add(
            [
                sprite("trout"),
                pos(randX, randY),
                origin("center"),
                body(),
                layer("objects"),
                "enemy",
                "TROUT" // Second tag is used on Game Over screen to tell you what killed you
            ]
        );

        // TODO: Performance?
        trout.action(() => handleTrout(trout));
    })


    handleNixon(nixon);

    const map = addLevel([
        "                                                 o",
        "               ...                               o",
        "                                                 o",
        "   ===                        =========          o",
        "                                                 o",
        "                  ===                            o",
        "                                                 o",
        "                              ......             o",
        "                                                 o",
        "                 .....                           o",
        "                                                 o",
        "       ...                                       o",
        "==========.......=====..=========================o",
    ],
        {
            width: 25,
            height: 25,
            pos: vec2(0, 0),
            "=": [sprite("dirt"), scale(1.0), solid(), layer("objects")],
            ".": [sprite("cobblestone"), scale(1.0), solid(), layer("objects")],
            "o": [sprite("dirt"), scale(1.0), solid(), layer("objects"), "goal"]
        });


});

start("menu")
