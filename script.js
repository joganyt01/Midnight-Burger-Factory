document.addEventListener('DOMContentLoaded', () => {

    const belt = document.getElementById('belt');
    const gameContainer = document.getElementById('game-container');
    const particleContainer = document.getElementById('particle-container');

    let burgers = [];

    const burgerSpacing = 165;

    let carouselOffset = 0;

    let conveyorSide = "left";
    let selectedBurgerIndex = 0;

    let twoBurgerPhase = 0;

    let cameraOffset = 0;

    let orderTimeout;

    let goodBurgers = 0;

    let wrongBurgers = 0;

    let score = 0;

    let combo = 0;
    let gamePaused = false;

    const machineSound =
        new Audio("maquina.mp3");

    machineSound.volume = 0.5;
    const successSound =
        new Audio("burgercompleted.mp3");

    successSound.volume = 0.5;

    const music = new Audio("musicburger.mp3");

    music.loop = true;

    music.volume = 0.4;

    const failSound =
        new Audio("burgerbad.mp3");

    failSound.volume = 0.2;

    const Youwin = new Audio("win.mp3")
    Youwin.volume = 0.4;

    const Youlose = new Audio("lose.mp3");
    Youlose.volume = 0.4;

    const tutorialSeen = {

        welcome: false,

        nextMove: false,

        prevMove: false,

        machine: false,

        validation: false,

        order: false,

        twoBurgers: false,

        finalBurger: false,
        firstOrderTutorial: false,
        fiveBurgers: false,

        fourBurgers: false,

        threeBurgers: false,

        twoBurgers: false,

        oneBurger: false,

        fourBurgerTutorial: false,

        threeBurgerTutorial: false,

        twoBurgerTutorial: false,

        oneBurgerTutorial: false
    };

    let tutorialOpen = false;
    let tutorialQueueOrder = false;

    let orderVisible = false;

    const MEMORY_TIME = 4000;



    let frozenPositions = [];
    let isDroppingIngredient = false;

    // =========================================
    // CONFIG

    // =========================================
    const GAME_SPEED = 2.5;
    const BURGER_START_X = -200;

    // =========================================
    // PARTICLE ATMOSPHERE
    // =========================================
    function createParticles() {

        for (let i = 0; i < 20; i++) {

            const p = document.createElement('div');

            p.className = 'ambient-particle';

            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';

            p.animate([
                {
                    transform: 'translateY(0px) translateX(0px)',
                    opacity: 0.2
                },
                {
                    transform: `translateY(-60px) translateX(${Math.random() * 40}px)`,
                    opacity: 0.8
                }
            ], {
                duration: 3000 + Math.random() * 4000,
                iterations: Infinity,
                direction: 'alternate',
                easing: 'ease-in-out'
            });

            particleContainer.appendChild(p);
        }
    }

    // =========================================
    // BURGER SPAWN
    // =========================================
    function spawnNewBurger() {



        const burger = document.createElement('div');

        burger.className = 'burger';

        const burgerData = {
            id: Date.now() + Math.random(),

            element: burger,

            x: burgers.length * burgerSpacing,

            ingredients: ['bun-bottom'],

            order: generateOrder(),

            completed: false
        };

        const idTag =
            document.createElement('div');

        idTag.className =
            'burger-id';

        idTag.textContent =
            '?';

        burger.appendChild(idTag);

        // Bottom bun
        const bottomBun =
            createIngredientLayer('bun-bottom');

        burger.appendChild(bottomBun);

        belt.appendChild(burger);

        burgers.push(burgerData);

        refreshBurgerIds();




        updateSelectedBurger();

        updateBurgerLabel();


    }

    function updateBurgerPositions() {


        let closestBurger = null;

        let closestDistance = Infinity;

        const usingTwoBurgerMode =
            burgers.length === 2;


        burgers.forEach((burger, index) => {

            let len = burgers.length;

            let diff = index - carouselOffset;

            // 🔥 normalización circular segura (evita desorden tras splice)
            diff = ((diff % len) + len) % len;

            if (diff > len / 2) {
                diff -= len;
            }

            let relativeIndex = diff;
            //de aqui
            let baseX = 390;

            // 🔥 modo expandido
            // cuando faltan burgers

            if (burgers.length < 5) {

                if (
                    !tutorialSeen.fourBurgerTutorial
                ) {

                    tutorialSeen.fourBurgerTutorial = true;
                    setTimeout(() => {
                        showTutorial(
                       "WHEN THERE ARE 4 BURGERS LEFT, THE SYSTEM SWITCHES TO SEPARATE CAROUSELS, SO YOU WILL HAVE TO PRESS THE RIGHT AND LEFT ARROWS SEVERAL TIMES TO ARRANGE THE BURGERS AND MOVE THROUGH EACH STATION"
                        );
                    }, 3000)

                }

                baseX =

                    conveyorSide === "left"
                        ? 240
                        : 405;
            }
            if (burgers.length < 4) {

                if (
                    !tutorialSeen.threeBurgerTutorial
                ) {

                    tutorialSeen.threeBurgerTutorial = true;


                    showTutorial(
                       "WHEN THERE ARE 3 BURGERS LEFT, THE SYSTEM BASICALLY WORKS ON SEPARATE CAROUSELS"
                    );


                }

                baseX =

                    conveyorSide === "left"
                        ? 240
                        : 560;
            }
            if (burgers.length === 1) {

                if (
                    !tutorialSeen.oneBurgerTutorial
                ) {

                    tutorialSeen.oneBurgerTutorial = true;

                    showTutorial(

                       "WHEN ONLY 1 HAMBURGER REMAINS, IT WILL GO THROUGH EACH STATION INDIVIDUALLY."
                    );
                }

                const LEFT_POS = 80;

                const CENTER_POS = 250;

                const LETTUCE_POS = 400;

                const LETTUCE_NEXT = 550;

                const TOMATTO_POS = 720;

                const phase = twoBurgerPhase;

                if (phase === 0) {

                    targetX = LEFT_POS;
                }

                if (phase === 1) {

                    targetX = CENTER_POS;
                }

                if (phase === 2) {

                    targetX = LETTUCE_POS;
                }

                if (phase === 3) {

                    targetX = LETTUCE_NEXT;
                }

                if (phase === 4) {

                    targetX = TOMATTO_POS;
                }

                // =====================================
                // 2 BURGER MODE
                // =====================================

            } else if (burgers.length === 2) {

                if (
                    !tutorialSeen.twoBurgerTutorial
                ) {

                    tutorialSeen.twoBurgerTutorial = true;

                    showTutorial(
                       "WHEN ONLY 2 BURGERS REMAIN, NAVIGATION IS SIMPLER, BUT SOME POSITIONS CHANGE DYNAMICALLY."
                    );
                }



                const LEFT_POS = 80;

                const CENTER_POS = 250;

                const LETTUCE_POS = 400;
                const LETTUCE_NEXT = 550;

                const RIGHT_POS = 400;

                const FAR_RIGHT_POS = 560;
                const EXTREME_RIGHT_POS = 720;

                const TOMATTO_POST = 720;
                const TOMATTO_NEXT = 560;

                const phase = twoBurgerPhase;

                // =========================
                // BURGER 1
                // =========================

                if (burger === burgers[0]) {

                    if (phase === 0) {

                        targetX = LEFT_POS;
                    }

                    if (phase === 1) {

                        targetX = CENTER_POS;
                    }

                    if (phase === 2) {

                        targetX = FAR_RIGHT_POS;
                    } if (phase === 3) {

                        targetX = LETTUCE_POS;
                    } if (phase == 4) {
                        targetX = TOMATTO_POST;
                    }

                }

                // =========================
                // BURGER 2
                // =========================

                if (burger === burgers[1]) {

                    if (phase === 0) {

                        targetX = CENTER_POS;
                    }

                    if (phase === 1) {

                        targetX = RIGHT_POS;
                    }

                    if (phase === 2) {

                        targetX = EXTREME_RIGHT_POS;
                    } if (phase === 3) {

                        targetX = LETTUCE_NEXT;
                    } if (phase == 4) {
                        targetX = TOMATTO_NEXT;
                    }

                }

            } else {

                targetX =

                    baseX +
                    (relativeIndex * burgerSpacing);
            }


            //hasta aqui
            const floatY =
                Math.sin(
                    Date.now() * 0.003 + index
                ) * 3;

            burger.element.style.left =
                `${targetX}px`;

            burger.element.style.opacity = 1;


            burger.element.style.transform =
                `translateY(${floatY}px)`;

            const distanceToCenter =

                Math.abs(targetX - 390);

            if (
                distanceToCenter <
                closestDistance
            ) {

                closestDistance =
                    distanceToCenter;

                closestBurger =
                    burger;
            }

        });

        burgers.forEach(b => {

            b.element.classList.remove(
                'selected-burger'
            );
        });

        if (closestBurger) {

            closestBurger.element.classList.add(
                'selected-burger'
            );
        }

        requestAnimationFrame(

            updateBurgerPositions
        );
    }

    function updateSelectedBurger() {

        burgers.forEach((burger) => {

            burger.element.classList.remove(
                'selected-burger'
            );
        });

        if (burgers[selectedBurgerIndex]) {

            burgers[selectedBurgerIndex].element.classList.add(
                'selected-burger'
            );
        }
    }

    function updateBurgerLabel() {



        const burgerLabel =
            document.querySelector(
                '.burger-slot'
            );

        if (!burgerLabel) return;

        burgerLabel.textContent =
            `BURGER ${selectedBurgerIndex + 1}`;
    }

    function getSelectedBurger() {

        return burgers[selectedBurgerIndex];
    }

    function focusSelectedBurger() {

        const selectedBurger =
            burgers[selectedBurgerIndex];

        if (!selectedBurger) return;

        const targetX = 350;

        cameraOffset +=
            (targetX - (selectedBurger.x + cameraOffset))
            * 0.08;
    }

    // =========================================
    // CREATE INGREDIENT
    // =========================================
    function createIngredientLayer(type) {

        const layer = document.createElement('div');

        layer.className = `ingredient ${type}`;

        return layer;
    }

    function generateOrder() {


        const possibleIngredients = [
            'patty',
            'cheese',
            'lettuce',
            'tomato'
        ];

        const total =
            Math.floor(Math.random() * 3) + 2;

        const order = ['bun-bottom'];

        for (let i = 0; i < total; i++) {

            const randomIngredient =
                possibleIngredients[
                Math.floor(
                    Math.random() *
                    possibleIngredients.length
                )
                ];

            order.push(randomIngredient);
        }

        order.push('bun-top');

        return order;
    }

    function renderOrder() {



        const orderList =
            document.getElementById(
                'order-list'
            );

        if (!orderList) return;

        orderList.innerHTML = '';

        const activeBurger =
            burgers[selectedBurgerIndex];

        console.log(
            "RENDER ORDER INDEX:",
            selectedBurgerIndex
        );


        if (!activeBurger) return;
        console.log(
            "ORDER:",
            activeBurger?.order
        );

        activeBurger.order.forEach(
            possibleIngredients => {

                const item =
                    document.createElement('div');

                item.className = 'order-item';

                item.textContent =
                    possibleIngredients
                        .replace('-', ' ')
                        .toUpperCase();

                orderList.appendChild(item);
            });
        console.log(
            "ORDER HTML:",
            orderList.innerHTML
        );
    }


    function showOrderTemporarily() {

        const panel =
            document.querySelector(
                '.order-panel'
            );

        panel.classList.remove(
            'hide-order'
        );



        renderOrder();

        clearTimeout(orderTimeout);

        // 🔥 SOLO ocultar si NO hay tutorial

        if (!tutorialOpen) {

            orderTimeout = setTimeout(() => {

                panel.classList.add(
                    'hide-order'
                );

            }, 4000);
        }
    }
    // =========================================
    // MOVE BURGER
    // =========================================


    // =========================================
    // DROP INGREDIENT
    // =========================================
    function dropIngredient(type) {
        isDroppingIngredient = true;

        frozenPositions = burgers.map(
            burger =>
                burger.element.style.transform
        );

        const machine = document.getElementById(`m-${type}`);

        const activeBurger =
            getSelectedBurger();

        if (!machine || !activeBurger) return;

        if (!tutorialSeen.machine) {

            tutorialSeen.machine = true;

            showTutorial(
               "THE BURGERS MUST COME OUT IN ORDER. IF YOU COMPLETE THE WRONG BURGER, THE GAME WILL COUNT AS A FAILURE."
            );
        }

        // =====================================
        // MACHINE BOUNCE
        // =====================================

        machine.classList.remove('machine-bounce');

        void machine.offsetWidth;

        machine.classList.add('machine-bounce');

        machineSound.currentTime = 0;

        machineSound.play();

        // =====================================
        // CREATE FALLING INGREDIENT
        // =====================================

        const machineRect = machine.getBoundingClientRect();

        const containerRect =
            gameContainer.getBoundingClientRect();

        const item = document.createElement('div');

        item.className =
            `ingredient ${type} falling-item`;

        const ingredientWidth = 120;

        item.style.left =
            (
                machineRect.left -
                containerRect.left +
                machineRect.width / 2 -
                ingredientWidth / 2
            ) + 'px';

        item.style.top = '120px';

        gameContainer.appendChild(item);

        let y = 120;

        const gravity = 9;

        // =====================================
        // FALL LOOP
        // =====================================

        function fall() {

            if (gamePaused) {

                requestAnimationFrame(fall);

                return;
            }
            y += gravity;

            item.style.top = `${y}px`;

            let closestBurger = null;

            let closestDistance = Infinity;
            const itemRect =
                item.getBoundingClientRect();

            burgers.forEach((burger) => {

                const burgerRect =
                    burger.element.getBoundingClientRect();



                const burgerCenter =
                    burgerRect.left + burgerRect.width / 2;

                const itemCenter =
                    itemRect.left + itemRect.width / 2;

                const horizontalDistance =
                    Math.abs(burgerCenter - itemCenter);



                let collisionThreshold =
                    burgerRect.width / 2 + 20;

                // 🔥 modo 2 burgers

                if (burgers.length === 2) {

                    collisionThreshold =
                        burgerRect.width / 2 + 120;
                }

                const verticalHit =
                    itemRect.bottom >= burgerRect.top;

                if (
                    horizontalDistance < collisionThreshold &&
                    verticalHit
                ) {



                    if (
                        horizontalDistance <
                        closestDistance
                    ) {

                        closestDistance =
                            horizontalDistance;

                        closestBurger =
                            burger;
                    }

                    createLandingParticles(
                        itemRect.left,
                        itemRect.top
                    );
                    isDroppingIngredient = false;
                    item.remove();
                }
            });

            if (closestBurger) {


                attachIngredientToBurger(
                    closestBurger,
                    type
                );

                createLandingParticles(
                    itemRect.left,
                    itemRect.top
                );

                item.remove();

                return;
            }

            // =================================
            // MISSED
            // =================================

            if (y < window.innerHeight) {

                requestAnimationFrame(fall);

            } else {

                createFailEffect(
                    parseFloat(item.style.left),
                    y
                );
                isDroppingIngredient = false;
                item.remove();
            }
        }


        requestAnimationFrame(fall);

    }

    // =========================================
    // ATTACH INGREDIENT
    // =========================================
    function attachToBurger(type) {

        const activeBurger =
            getSelectedBurger();

        if (!activeBurger) return;

        const layer = createIngredientLayer(type);

        layer.classList.add('land-bounce');

        activeBurger.element.appendChild(layer);

        activeBurger.ingredients.push(type);

        // Juicy burger bounce
        activeBurger.element.classList.add('burger-hit');

        setTimeout(() => {
            activeBurger.element.classList.remove('burger-hit');
        }, 250);

        if (type === 'bun-top') {

            validateBurger(activeBurger);
        }
    }

    function attachIngredientToBurger(
        burger,
        type
    ) {

        const layer =
            createIngredientLayer(type);

        layer.classList.add(
            'land-bounce'
        );

        burger.element.appendChild(layer);

        burger.ingredients.push(type);

        burger.element.classList.add(
            'burger-hit'
        );

        setTimeout(() => {

            burger.element.classList.remove(
                'burger-hit'
            );

        }, 250);

        if (type === 'bun-top') {

            validateBurger(burger);
        }
    }


    function showResult(text, color) {

        const display =
            document.querySelector('.result-screen');

        display.textContent = text;

        display.style.color = color;

        display.classList.add('show-result');

        setTimeout(() => {

            display.classList.remove(
                'show-result'
            );

        }, 1200);
    }

    function validateBurger(burger) {

        if (!burger) return false;



        // =========================
        // PLAYER INGREDIENTS
        // =========================

        const builtIngredients =

            burger.ingredients.filter(
                item =>
                    item !== 'bun-bottom' &&
                    item !== 'bun-top'
            );

        // =========================
        // REQUIRED INGREDIENTS
        // =========================

        const requiredIngredients =

            burger.order.filter(
                item =>
                    item !== 'bun-bottom' &&
                    item !== 'bun-top'
            );



        // =========================
        // IGNORE ORDER
        // =========================

        builtIngredients.sort();

        requiredIngredients.sort();

        const isCorrect =

            JSON.stringify(
                builtIngredients
            )

            ===

            JSON.stringify(
                requiredIngredients
            );

        // =========================
        // RESULT
        // =========================

        if (!tutorialSeen.validation) {

            tutorialSeen.validation = true;

            showTutorial(
               "THE RIGHT BURGERS GIVE POINTS AND INCREASE THE COMBO. THE WRONG ONES BREAK THE COMBO."
            );
        }
        if (isCorrect) {

            successSound.currentTime = 0;

            successSound.play().catch(() => { });

            showResult(
                "GOOD",
                "#2FB20E",

            );

            burger.element.classList.add(
                'box-success'
            );

            goodBurgers++;
            combo++;

            score += 100 * combo;

            updateHUD();


        } else {

            failSound.currentTime = 0;

            failSound.play().catch(() => { });
            showResult(
                "WRONG",
                "#ff3b3b"
            );

            burger.element.classList.add(
                'trash-fail'
            );
            wrongBurgers++;

            combo = 0;

            updateHUD();
        }

        // =========================
        // REMOVE BURGER
        // =========================
        setTimeout(() => {
            console.log("TIMEOUT RUNNING");
            burger.element.remove();

            const burgerIndex = burgers.indexOf(burger);

            if (burgerIndex !== -1) {
                burgers.splice(burgerIndex, 1);
                checkGameResult();
            }

            // 🔥 volver al primer elemento del array
            selectedBurgerIndex = 0;

            updateSelectedBurger();
            updateBurgerLabel();
            renderOrder();

            showOrderTemporarily();


        }, 800);



        return isCorrect;
    }

    function updateHUD() {

        document.getElementById(
            'score-text'
        ).textContent =

            `SCORE: ${score}`;

        document.getElementById(
            'combo-text'
        ).textContent =

            `COMBO x${combo}`;
    }

    function checkGameResult() {

        if (burgers.length > 0) return;

        // =========================
        // WIN
        // =========================

        if (goodBurgers >= 3) {

            Youwin.currentTime = 0;

            Youwin.play().catch(() => { });

            showResult(
                "YOU WIN",
                "#00ff99"
            );

        } else {

            // =========================
            // LOSE
            // =========================
            Youlose.currentTime = 0;

            Youlose.play().catch(() => { });
            showResult(
                "YOU LOSE",
                "#ff3b3b"
            );
        }
    }

    function screenParticlesBurst(color) {

        const container =
            document.querySelector(
                '.result-particles'
            );

        for (let i = 0; i < 25; i++) {

            const p =
                document.createElement('div');

            p.className =
                'result-burst';

            if (color === "#ff3b3b") {

                p.style.background = "#ff3b3b";

                p.style.color = "#ff3b3b";

            } else {

                p.style.background = "#ffd500";

                p.style.color = "#ffd500";
            }

            p.style.left =
                '50%';

            p.style.top =
                '50%';

            p.style.setProperty(
                '--moveX',
                `${(Math.random() - 0.5) * 300}px`
            );

            p.style.setProperty(
                '--moveY',
                `${(Math.random() - 0.5) * 300}px`
            );

            container.appendChild(p);

            setTimeout(() => {

                p.remove();

            }, 3000);
        }
    }

    function showResult(text, color) {

        const resultText =
            document.getElementById('result-text');

        resultText.textContent = text;

        resultText.style.color = color;

        if (
            text === "YOU WIN" ||
            text === "YOU LOSE"
        ) {

            resultText.style.fontSize =
                '1.0rem';

        } else {

            resultText.style.fontSize =
                '';
        }

        resultText.animate([
            {
                transform: 'scale(1)'
            },
            {
                transform: 'scale(1.15)'
            },
            {
                transform: 'scale(1)'
            }
        ], {
            duration: 400
        });

        screenParticlesBurst(color);
    }


    function refreshBurgerIds() {

        burgers.forEach(
            (burger, index) => {

                const idTag =
                    burger.element.querySelector(
                        '.burger-id'
                    );

                if (idTag) {

                    idTag.textContent =
                        index + 1;
                }
            });
    }

    // =========================================
    // LANDING PARTICLES
    // =========================================
    function createLandingParticles(x, y) {

        for (let i = 0; i < 6; i++) {

            const particle = document.createElement('div');

            particle.className = 'hit-particle';

            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            gameContainer.appendChild(particle);

            particle.animate([
                {
                    transform: 'translate(0px,0px) scale(1)',
                    opacity: 1
                },
                {
                    transform: `
                        translate(
                            ${(Math.random() - 0.5) * 80}px,
                            ${(Math.random() - 0.5) * 80}px
                        )
                        scale(0)
                    `,
                    opacity: 0
                }
            ], {
                duration: 500,
                easing: 'ease-out'
            });

            setTimeout(() => {
                particle.remove();
            }, 500);
        }
    }

    // =========================================
    // FAIL EFFECT
    // =========================================
    function createFailEffect(x, y) {

        const splat = document.createElement('div');

        splat.className = 'fail-splat';

        splat.style.left = `${x}px`;
        splat.style.top = `${y}px`;

        gameContainer.appendChild(splat);

        splat.animate([
            {
                transform: 'scale(0)',
                opacity: 1
            },
            {
                transform: 'scale(1.5)',
                opacity: 0
            }
        ], {
            duration: 400,
            easing: 'ease-out'
        });

        setTimeout(() => {
            splat.remove();
        }, 400);
    }

    // =========================================
    // EXPOSE TO HTML
    // =========================================
    window.dropIngredient = dropIngredient;

    // =========================================
    // START BUTTON
    // =========================================

    const startButton = document.querySelector('.btn-play');
    const prevButton =
        document.getElementById('prev-burger');

    const nextButton =
        document.getElementById('next-burger');

    startButton.addEventListener('click', startGame);

    prevButton.addEventListener('click', () => {
        if (gamePaused) return;

        if (!tutorialSeen.prevMove) {

            tutorialSeen.prevMove = true;

            showTutorial(
               "USE THE NEXT AND PREV BUTTONS TO MOVE THE HAMBURGER CAROUSEL."
            );
        }

        carouselOffset--;



        if (selectedBurgerIndex < 0) {
            selectedBurgerIndex =
                burgers.length - 1;
        }

        if (selectedBurgerIndex === 0) {

            conveyorSide = "left";

        } else {

            selectedBurgerIndex--;
        }


        if (burgers.length === 2 ||
            burgers.length === 1) {

            twoBurgerPhase--;

            if (twoBurgerPhase < 0) {

                twoBurgerPhase = 4;
            }

        } else {


        }


        updateBurgerLabel();




    });

    nextButton.addEventListener('click', () => {
        if (gamePaused) return;
        if (!tutorialSeen.nextMove) {

            tutorialSeen.nextMove = true;

            showTutorial(
              "WHEN YOU PRESS RIGHT, THE HAMBURGERS MOVE TO THE LEFT. WHEN YOU PRESS LEFT, THE HAMBURGERS MOVE TO THE RIGHT."

            );
        }
        carouselOffset++;

        if (
            selectedBurgerIndex >= burgers.length
        ) {
            selectedBurgerIndex = 0;
        }

        if (
            selectedBurgerIndex ===
            burgers.length - 1
        ) {

            conveyorSide = "right";

        } else {

            selectedBurgerIndex++;
        }

        if (burgers.length === 2 ||
            burgers.length === 1) {

            twoBurgerPhase++;

            if (twoBurgerPhase > 4) {

                twoBurgerPhase = 0;
            }

        } else {


        }

        updateBurgerLabel();




    });

    const pauseBtn =
        document.getElementById(
            'pause-btn'
        );

    pauseBtn.addEventListener(
        'click',
        () => {

            gamePaused =
                !gamePaused;

            pauseBtn.textContent =
                gamePaused
                    ? 'RESUME'
                    : 'PAUSE';

            if (gamePaused) {

                music.pause();

            } else {

                music.play();
            }
        }
    );

    const restartBtn =
        document.getElementById(
            'restart-btn'
        );

    restartBtn.addEventListener(
        'click',
        () => {

            location.reload();
        }
    );

    function startGame() {


        // Ocultar menú
        document.querySelector('.menu-container').style.display = 'none';

        document.querySelector('.game-logo')
            .classList.add('hide-ui');

        document.querySelector('.ui-decoration')
            .classList.add('hide-ui');

        document.querySelector('.neon-sign')
            .classList.add('hide-ui');
        // Mostrar máquinas
        const dispenserLine = document.querySelector('.dispenser-line');

        dispenserLine.classList.remove('hidden-machines');

        document
            .querySelector('.result-screen')
            .classList.remove('hidden-status');

        setTimeout(() => {

            document
                .querySelector('.result-screen')
                .classList.add('show-status');

        }, 50);





        document
            .querySelector('.burger-controls')
            .classList.remove('hidden-controls');

        setTimeout(() => {

            document
                .querySelector('.burger-controls')
                .classList.add('show-controls');

        }, 50);


        // Iniciar gameplay
        for (let i = 0; i < 5; i++) {

            spawnNewBurger();
            selectedBurgerIndex = 0;
        }

        renderOrder();





        showTutorial(
           "WELCOME TO BURGER FACTORY. YOUR GOAL IS TO COMPLETE THE BURGERS CORRECTLY. THE CURRENT ORDER APPEARS FOR ONLY A FEW SECONDS. MEMORIZE THE INGREDIENTS BEFORE CONTINUING."
        );





        tutorialQueueOrder = true;
        setTimeout(() => {

            dispenserLine.classList.add(
                'show-machines'
            );

            document
                .querySelector('.order-panel')
                .classList.remove(
                    'hidden-order'
                );

            document
                .querySelector('.order-panel')
                .classList.remove(
                    'hide-order'
                );



        }, 50);



        const gameButtons =
            document.querySelector(
                '.game-buttons'
            );

        gameButtons.classList.remove(
            'hidden-game-buttons'
        );

        setTimeout(() => {

            gameButtons.classList.add(
                'show-game-buttons'
            );

        }, 50);

        playMusic();




    }
    function playMusic() {

        if (!gamePaused) {

            music.play();
        }
    }

    function showTutorial(text) {
        tutorialOpen = true;
        const overlay =
            document.querySelector(
                '.tutorial-overlay'
            );

        const tutorialText =
            document.getElementById(
                'tutorial-text'
            );

        overlay.classList.remove(
            'hidden-tutorial'
        );

        tutorialText.textContent =
            text;
    }

    document
        .getElementById(
            'tutorial-next'
        )
        .addEventListener(
            'click',
            () => {

                tutorialOpen = false;

                document
                    .querySelector(
                        '.tutorial-overlay'
                    )
                    .classList.add(
                        'hidden-tutorial'
                    );

                // 🔥 SOLO después bienvenida



                showOrderTemporarily();

            }
        );

  
    // =========================================
    // START GAME ATMOSPHERE
    // =========================================
    createParticles();

    updateBurgerPositions();

});