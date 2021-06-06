const NIXON_JUMP_FORCE = 300;
const NIXON_RUN_SPEED = 100;
const TROUT_JUMP_FORCE = 150;
const TROUT_MOVE_SPEED = 75;

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


// SPRITES
loadSprite("trout", "./trout.png", {
    sliceY: 2,
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


function handleNixon(nixon) {

    // Make the camera follow Richard
    // nixon.action(() => {
    //     camPos(nixon.pos);
    // });

    nixon.play("idle");

    keyPress("space", () => {
        nixon.play("kick");
        every("enemy", (enemy) => {
            // If the enemy is within 1 unit of Richard, punch it
            if (nixon.pos.dist(enemy.pos) < 75) {
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
            nixon.move(NIXON_RUN_SPEED);
    });

    keyDown(["left", "right"], () => {
		if (nixon.grounded() && nixon.curAnim() !== "run") {
			nixon.play("run");
		}
	});

	keyRelease(["left", "right"], () => {
		if (!keyIsDown("right") && !keyIsDown("left")) {
			nixon.play("idle");
		}
	});

    keyDown("left", () => {
        // nixon.flipX(-1);
        nixon.move(-NIXON_RUN_SPEED);
    });

    nixon.on("grounded", () => {
        if (nixon.curAnim() === "jump") {
            nixon.play("idle");
        }
    })
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

    play("title");


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
        go("main");
        play("battle", { volume: 1.0, speed: 1.5});
    });
});

scene("gameOver", ({enemy, score}) => {
    layers([
        "bg",
        "ui",
    ]);
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
		go("main");
	});
});


scene("main", () => {

    layers([
        "bg",
        "objects",
        "ui",
    ]);

    	// display score
	const score = add([
		text("0", 16),
		layer("ui"),
		pos(9, 9),
		{
			value: 0,
		},
	]);

	function addScore() {
		score.value += 100;
		score.text = score.value;
	}

    on("destroy", "enemy", () => {
        addScore();
        play("explosion");
    });
    
    // background image
    add([
        sprite("cave_bg"),
        scale(width() / 240, height() / 240),
        layer("bg"),
        // pos(0, 0),
        // origin("topleft")
    ]);

    const nixon = add([
        sprite("nixon"),
        pos(8, 8),
        origin("center"),
        layer("objects"),
        body(),
    ]);


    nixon.collides("enemy", (enemy) => {
        if (NIXON_STATE.health > 1) {
            NIXON_STATE.health--;
        } else {
            console.log(enemy);
            go("gameOver", {enemy, score});
            if (Math.floor(Math.random() * 10) % 2 === 0) {
                play("aroo", { speed: 1.0 });
            } else {
                play("richard", { speed: 1.0 });
            }
        }
        
    });


    add(
        [
            sprite("trout"),
            pos(550, 110),
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
        add(
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
    })


    handleNixon(nixon);

    const map = addLevel([
        "                         ",
        "               ...       ",
        "                         ",
        "   ===                   ",
        "                         ",
        "                  ===    ",
        "                         ",
        "                         ",
        "                         ",
        "                 .....   ",
        "                         ",
        "       ...               ",
        "==========.......=====...",
    ],
    {
        width: 25,
        height: 25,
        pos: vec2(0, 0),
        "=": [sprite("cave"), scale(0.5), solid(), layer("objects")],
        ".": [sprite("cobblestone"), scale(0.75), solid(),  layer("objects")],
    })
    
    every("TROUT", (t) => {
        t.action(() => {
            // Jump over and over, and move while in the air
            if (t.grounded()) {
                t.jump(TROUT_JUMP_FORCE);
            } else {
                t.move(-TROUT_MOVE_SPEED);
            }
        });
    });

    
});

start("menu")
