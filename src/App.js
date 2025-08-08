import React from 'react';

// Main App Component
const App = () => {
    // --- STATE MANAGEMENT ---
    // State to hold the word list for the game. This will be updated by the user.
    const [wordList, setWordList] = React.useState(['LION', 'TIGER', 'ZEBRA', 'MONKEY', 'SNAKE', 'GIRAFFE', 'CLOUD', 'APPLE', 'WATER', 'HAPPY', 'PANDA']);

    // State for the current game word
    const [currentWord, setCurrentWord] = React.useState('');
    // State for the jumbled letters of the current word
    const [jumbledLetters, setJumbledLetters] = React.useState([]);
    // State for the user's current attempt
    const [userInput, setUserInput] = React.useState([]);
    // State for the game score
    const [score, setScore] = React.useState(0);
    // State for the player's remaining lives
    const [lives, setLives] = React.useState(3);
    // State for feedback messages (e.g., "Correct!", "Try Again!")
    const [message, setMessage] = React.useState('');
    // State to track the game's status (playing, success, gameover)
    const [gameStatus, setGameStatus] = React.useState('playing'); // 'playing', 'success', 'gameover', 'word-input'

    // NEW: State to control the visibility of the word input modal
    const [isWordInputVisible, setIsWordInputVisible] = React.useState(false);
    // NEW: State to hold the string of words the user types in
    const [customWordsInput, setCustomWordsInput] = React.useState('');

    // --- HELPER FUNCTIONS ---
    // Function to shuffle an array (used for jumbling letters)
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
        }
        return newArray;
    };

    // --- GAME LOGIC ---
    // Function to start a new round
    const startNewRound = React.useCallback(() => {
        if (wordList.length === 0) {
            setGameStatus('word-input');
            setMessage("Please enter some words to play!");
            return;
        }

        // Select a random word from the list
        const wordIndex = Math.floor(Math.random() * wordList.length);
        const newWord = wordList[wordIndex];

        setCurrentWord(newWord);
        // Jumble the letters of the new word
        setJumbledLetters(shuffleArray(newWord.split('')));
        // Reset user input and message
        setUserInput([]);
        setMessage('');
        setGameStatus('playing');
    }, [wordList]);

    // Function to restart the entire game
    const restartGame = () => {
        setScore(0);
        setLives(3);
        startNewRound();
    };

    // Initialize the game on first render
    React.useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    // NEW: Function to handle the submission of custom words
    const handleWordsSubmit = () => {
        const wordsArray = customWordsInput
            .toUpperCase()
            .split(/[,\s]+/) // Split by comma or any whitespace
            .filter(word => word.length > 0); // Remove empty strings

        if (wordsArray.length > 0) {
            setWordList(wordsArray);
            setIsWordInputVisible(false);
            setMessage('Your new word list has been saved! Get ready!');
            // Start the game with the new list
            setTimeout(() => {
                startNewRound();
            }, 1500);
        } else {
            setMessage("Please enter at least one word.");
        }
    };

    // --- EVENT HANDLERS ---
    // Handles clicking on a letter tile
    const handleLetterClick = (letter, index) => {
        if (gameStatus !== 'playing') return;

        // Add the clicked letter to the user's input
        setUserInput([...userInput, letter]);
        // Remove the letter from the jumbled pool
        const newJumbled = [...jumbledLetters];
        newJumbled.splice(index, 1);
        setJumbledLetters(newJumbled);
    };

    // Handles clicking the "Clear" button
    const handleClear = () => {
        if (gameStatus !== 'playing') return;
        // Reset the jumbled letters and user input
        setJumbledLetters(shuffleArray(currentWord.split('')));
        setUserInput([]);
    };

    // Handles clicking the "Submit" button
    const handleSubmit = () => {
        if (gameStatus !== 'playing' || userInput.length === 0) return;

        const guessedWord = userInput.join('');

        if (guessedWord === currentWord) {
            // CORRECT GUESS
            setScore(score + 10);
            setMessage('Correct! 🎉');
            setGameStatus('success');
            // Move to the next word after a short delay
            setTimeout(() => {
                startNewRound();
            }, 1500);
        } else {
            // INCORRECT GUESS
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives > 0) {
                setMessage('Not quite, try again! 🤔');
                // Reset the letters for another attempt
                setTimeout(handleClear, 1000);
            } else {
                setMessage(`Game Over! The word was ${currentWord}.`);
                setGameStatus('gameover');
            }
        }
    };

    // --- RENDER ---
    return (
        <div className="bg-yellow-50 min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center transform transition-all duration-500">
                
                {/* Game Header */}
                <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-yellow-500 tracking-wider">Spelling Safari</h1>
                    <p className="text-gray-500 mt-2">Unscramble the letters to spell the word!</p>
                </div>

                {/* Word Input Button */}
                <div className="mb-6">
                    <button onClick={() => setIsWordInputVisible(true)} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full shadow-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300">
                        Customize Words
                    </button>
                </div>

                {/* Score and Lives Display */}
                <div className="flex justify-around items-center mb-8 bg-green-50 p-4 rounded-xl">
                    <div className="text-lg font-semibold text-green-800">
                        Score: <span className="font-bold text-2xl">{score}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-red-800">Lives:</span>
                        <div className="flex">
                            {Array(lives).fill().map((_, i) => (
                                <svg key={i} className="w-8 h-8 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Game Area */}
                {gameStatus === 'playing' || gameStatus === 'success' ? (
                    <>
                        {/* User Input Area (Answer Box) */}
                        <div className="bg-gray-100 rounded-lg min-h-[80px] flex items-center justify-center p-4 mb-6 border-2 border-gray-200">
                            {userInput.length > 0 ? (
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {userInput.map((letter, index) => (
                                        <div key={index} className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-green-400 text-white text-3xl font-bold rounded-lg shadow-md">
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">Click letters below</span>
                            )}
                        </div>

                        {/* Jumbled Letters Pool */}
                        <div className="min-h-[80px] flex items-center justify-center p-4 mb-6">
                            <div className="flex flex-wrap gap-3 justify-center">
                                {jumbledLetters.map((letter, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleLetterClick(letter, index)}
                                        className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-white text-3xl font-bold rounded-lg shadow-lg transform hover:scale-110 transition-transform duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-300"
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={handleClear} className="px-8 py-3 bg-red-500 text-white font-bold rounded-full shadow-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-300">
                                Clear
                            </button>
                            <button onClick={handleSubmit} className="px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-300">
                                Submit
                            </button>
                        </div>
                    </>
                ) : (
                    // Game Over Screen
                    <div className="my-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">{message}</h2>
                        {gameStatus === 'gameover' && (
                            <p className="text-xl text-gray-600 mb-6">Your final score is: {score}</p>
                        )}
                        <button onClick={restartGame} className="px-10 py-4 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 text-xl">
                            {gameStatus === 'word-input' ? 'Play with Default Words' : 'Play Again?'}
                        </button>
                    </div>
                )}

                {/* Feedback Message Display */}
                {message && gameStatus !== 'gameover' && (
                    <div className={`mt-6 p-3 rounded-lg font-semibold text-lg transition-all duration-300 ${gameStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
            </div>

            {/* NEW: Word Input Modal */}
            {isWordInputVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center relative">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Your Spelling Words</h2>
                        <p className="text-gray-500 mb-6">Separate words with a comma or a space.</p>
                        <textarea
                            value={customWordsInput}
                            onChange={(e) => setCustomWordsInput(e.target.value)}
                            className="w-full h-32 p-4 mb-6 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="e.g., CAT, DOG, ELEPHANT"
                        ></textarea>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleWordsSubmit} className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-300">
                                Save Words & Play
                            </button>
                            <button onClick={() => setIsWordInputVisible(false)} className="px-6 py-3 bg-gray-300 text-gray-800 font-bold rounded-full shadow-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

