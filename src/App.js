import React, { useState, useEffect, useCallback } from 'react';

// Main App Component
const App = () => {
    // --- PREDEFINED WORD LISTS ---
    const predefinedLists = {
        Animals: ['LION', 'TIGER', 'ZEBRA', 'MONKEY', 'SNAKE', 'PANDA', 'GIRAFFE', 'ELEPHANT'],
        Fruits: ['APPLE', 'ORANGE', 'BANANA', 'GRAPE', 'STRAWBERRY', 'MANGO', 'CHERRY'],
        Colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'BROWN'],
    };

    // --- STATE MANAGEMENT ---
    const [wordList, setWordList] = useState(predefinedLists.Animals);
    const [selectedList, setSelectedList] = useState('Animals');
    const [currentWord, setCurrentWord] = useState('');
    const [shuffledWordList, setShuffledWordList] = useState([]);
    const [wordIndex, setWordIndex] = useState(0);
    const [jumbledLetters, setJumbledLetters] = useState([]);
    const [userInput, setUserInput] = useState([]);
    const [correctAttempts, setCorrectAttempts] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [lives, setLives] = useState(3);
    const [message, setMessage] = useState('');
    const [gameStatus, setGameStatus] = useState('playing');
    const [isWordInputVisible, setIsWordInputVisible] = useState(false);
    const [customWordsInput, setCustomWordsInput] = useState('');
    const [isRulesModalVisible, setIsRulesModalVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isGameOverAnimating, setIsGameOverAnimating] = useState(false);

    // --- HELPER FUNCTIONS ---
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // --- GAME LOGIC ---
    const startNewRound = useCallback(() => {
        if (shuffledWordList.length === 0) {
            setGameStatus('word-input');
            setMessage("Please enter some words to play!");
            return;
        }

        if (wordIndex >= shuffledWordList.length) {
            setGameStatus('all-words-done');
            setMessage("Congratulations! You've spelled all the words in this list!");
            return;
        }

        const newWord = shuffledWordList[wordIndex];
        setCurrentWord(newWord);
        setJumbledLetters(shuffleArray(newWord.split('')));
        setUserInput([]);
        setMessage('');
        setGameStatus('playing');
    }, [shuffledWordList, wordIndex]);

    const restartGame = useCallback(() => {
        setCorrectAttempts(0);
        setTotalAttempts(0);
        setLives(3);
        setWordIndex(0);
        setShuffledWordList(shuffleArray(wordList));
    }, [wordList]);

    useEffect(() => {
        if (wordList.length > 0) {
            setShuffledWordList(shuffleArray(wordList));
        }
    }, [wordList]);

    useEffect(() => {
        if (shuffledWordList.length > 0) {
            startNewRound();
        }
    }, [shuffledWordList, startNewRound]);

    // Function to handle changing the word list from the dropdown
    const handleListChange = (e) => {
        const listName = e.target.value;
        setSelectedList(listName);
        if (listName === 'Custom') {
            const savedList = JSON.parse(localStorage.getItem('customWordList')) || [];
            setWordList(savedList);
            setIsWordInputVisible(true);
        } else {
            setWordList(predefinedLists[listName]);
            restartGame();
        }
    };

    const handleWordsSubmit = () => {
        const wordsArray = customWordsInput
            .toUpperCase()
            .split(/[,\s]+/)
            .filter(word => word.length > 0);

        if (wordsArray.length > 0) {
            setWordList(wordsArray);
            localStorage.setItem('customWordList', JSON.stringify(wordsArray));
            setSelectedList('Custom');
            setIsWordInputVisible(false);
            setMessage('Your new word list has been saved! Get ready!');
            setCorrectAttempts(0);
            setTotalAttempts(0);
            setLives(3);
            setShuffledWordList(shuffleArray(wordsArray));
        } else {
            setMessage("Please enter at least one word.");
        }
    };

    // --- EVENT HANDLERS ---
    const handleLetterClick = (letter, index) => {
        if (gameStatus !== 'playing') return;
        setUserInput([...userInput, letter]);
        const newJumbled = [...jumbledLetters];
        newJumbled.splice(index, 1);
        setJumbledLetters(newJumbled);
    };

    const handleClear = () => {
        if (gameStatus !== 'playing') return;
        setJumbledLetters(shuffleArray(currentWord.split('')));
        setUserInput([]);
    };

    const handleSubmit = () => {
        if (gameStatus !== 'playing' || userInput.length === 0) return;

        const guessedWord = userInput.join('');
        setTotalAttempts(prevTotalAttempts => prevTotalAttempts + 1);

        if (guessedWord === currentWord) {
            setCorrectAttempts(prevCorrectAttempts => prevCorrectAttempts + 1);
            setMessage('Correct! 🎉');
            setGameStatus('success');
            setTimeout(() => {
                setWordIndex(wordIndex + 1);
                startNewRound();
            }, 1500);
        } else {
            const newLives = lives - 1;
            setLives(newLives);
            setIsAnimating(true); // Trigger shake animation
            if (newLives > 0) {
                setMessage('Not quite, try again! 🤔');
                setTimeout(() => {
                    handleClear();
                    setIsAnimating(false); // End shake animation
                }, 1000);
            } else {
                setMessage(`Game Over! The word was ${currentWord}.`);
                setGameStatus('gameover');
                setIsGameOverAnimating(true); // Trigger game over animation
                setTimeout(() => {
                    setIsAnimating(false);
                    setIsGameOverAnimating(false);
                }, 3000);
            }
        }
    };

    const percentageScore = totalAttempts > 0 
        ? Math.round((correctAttempts / totalAttempts) * 100) 
        : 0;

    const backgroundImageUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPz4tYHhUTTy9ZhOs39p2E9LzMzd44uLnOHFSFR5BfFR2kkK72zg6vWP6Ctwa9uNTH9wcH-CSrFvIFvcfDOQQfnO1l1i6c5N9S-rUjSkFoIGY3JDIjloPhNmfWmFLgxw_OLWkI9fhonXoqa7pgh1mh_IfkEvmCq0X7v06I1diIAXWssOxqG2UddkZLq1U/s16000/35101.jpg';

    // --- RENDER ---
    return (
        <div 
            className="min-h-screen flex items-center justify-center font-sans p-4 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            {/* Semi-transparent overlay for readability */}
            <div className="absolute inset-0 bg-black opacity-40"></div>
            
            {/* Main content container */}
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-center transform transition-all duration-500 relative z-10 border-4 border-yellow-400">
                
                {/* Game Header */}
                <div className="mb-6 relative">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-blue-600 tracking-wider font-['Lilita_One'] drop-shadow-lg">Spelling Safari</h1>
                    <p className="text-gray-500 mt-2 text-lg font-bold">Unscramble the letters!</p>
                    <button onClick={() => setIsRulesModalVisible(true)} className="absolute top-0 right-0 p-2 text-xl text-blue-500 hover:text-blue-700 transition-colors">
                        ❓
                    </button>
                </div>
                
                {/* Word List Selector */}
                <div className="flex justify-center items-center mb-6">
                    <label htmlFor="word-list-select" className="mr-2 text-lg font-bold text-gray-700">Word List:</label>
                    <select
                        id="word-list-select"
                        value={selectedList}
                        onChange={handleListChange}
                        className="p-2 rounded-lg border-2 border-gray-300 bg-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.keys(predefinedLists).map((listName) => (
                            <option key={listName} value={listName}>{listName}</option>
                        ))}
                        <option value="Custom">Import Your Words</option>
                    </select>
                </div>

                {/* Score and Lives Display */}
                <div className="flex justify-around items-center mb-8 bg-gradient-to-r from-green-300 to-green-500 p-4 rounded-xl shadow-lg">
                    <div className="text-lg font-extrabold text-white">
                        Score: <span className="font-bold text-3xl">{percentageScore}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-extrabold text-white">Lives:</span>
                        <div className="flex">
                            {Array(lives).fill().map((_, i) => (
                                <span key={i} className="text-3xl animate-heartbeat">❤️</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Game Area */}
                {gameStatus === 'playing' || gameStatus === 'success' ? (
                    <>
                        {/* User Input Area (Answer Box) */}
                        <div className={`bg-gray-100 rounded-lg min-h-[80px] flex items-center justify-center p-4 mb-6 border-4 border-gray-200 shadow-inner ${isAnimating ? 'animate-shake' : ''}`}>
                            {userInput.length > 0 ? (
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {userInput.map((letter, index) => (
                                        <div key={index} className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-green-500 text-white text-4xl font-extrabold rounded-xl shadow-md transform scale-105 animate-pop">
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400 text-xl font-bold">Click letters to spell!</span>
                            )}
                        </div>

                        {/* Jumbled Letters Pool */}
                        <div className="min-h-[80px] flex items-center justify-center p-4 mb-6">
                            <div className="flex flex-wrap gap-3 justify-center">
                                {jumbledLetters.map((letter, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleLetterClick(letter, index)}
                                        className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-white text-4xl font-extrabold rounded-xl shadow-lg transform hover:scale-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-300 animate-bounce"
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={handleClear} className="px-8 py-3 bg-red-500 text-white font-extrabold rounded-full shadow-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 transform hover:scale-105">
                                Clear
                            </button>
                            <button onClick={handleSubmit} className="px-8 py-3 bg-green-500 text-white font-extrabold rounded-full shadow-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 transform hover:scale-105">
                                Submit
                            </button>
                        </div>
                    </>
                ) : gameStatus === 'all-words-done' ? (
                    // Congratulations Screen
                    <div className={`my-10 animate-fade-in ${isGameOverAnimating ? 'animate-confetti' : ''}`}>
                        <h2 className="text-4xl font-extrabold text-purple-600 mb-4 font-['Lilita_One']">Congratulations! 🥳</h2>
                        <p className="text-xl text-gray-700 mb-6">You've spelled all the words!</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                            <button onClick={restartGame} className="px-10 py-4 bg-green-500 text-white font-extrabold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 text-xl">
                                Play again?
                            </button>
                            <button onClick={() => setIsWordInputVisible(true)} className="px-10 py-4 bg-blue-500 text-white font-extrabold rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 text-xl">
                                Change list
                            </button>
                        </div>
                    </div>
                ) : (
                    // Game Over Screen
                    <div className={`my-10 animate-fade-in ${isGameOverAnimating ? 'animate-shake' : ''}`}>
                        <h2 className="text-4xl font-extrabold text-red-600 mb-4 font-['Lilita_One']">{message}</h2>
                        {gameStatus === 'gameover' && (
                            <p className="text-xl text-gray-600 mb-6">Your final score is: <span className="font-bold">{percentageScore}</span></p>
                        )}
                        <button onClick={restartGame} className="px-10 py-4 bg-blue-500 text-white font-extrabold rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 text-xl">
                            Play Again?
                        </button>
                    </div>
                )}

                {/* Feedback Message Display */}
                {message && gameStatus !== 'all-words-done' && gameStatus !== 'gameover' && (
                    <div className={`mt-6 p-3 rounded-xl font-extrabold text-lg transition-all duration-300 shadow-md ${gameStatus === 'success' ? 'bg-green-100 text-green-800 animate-pulse' : 'bg-red-100 text-red-800 animate-pulse'}`}>
                        {message}
                    </div>
                )}
            </div>

            {/* Word Input Modal */}
            {isWordInputVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center relative border-4 border-yellow-400">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-['Lilita_One']">Import Your Words</h2>
                        <p className="text-gray-500 mb-6">Separate words with a comma or a space.</p>
                        <textarea
                            value={customWordsInput}
                            onChange={(e) => setCustomWordsInput(e.target.value)}
                            className="w-full h-32 p-4 mb-6 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="e.g., SYLLABUS, MATH, SCIENCE"
                        ></textarea>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleWordsSubmit} className="px-6 py-3 bg-green-500 text-white font-extrabold rounded-full shadow-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-300">
                                Save Words & Play
                            </button>
                            <button onClick={() => setIsWordInputVisible(false)} className="px-6 py-3 bg-gray-300 text-gray-800 font-extrabold rounded-full shadow-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Modal */}
            {isRulesModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative border-4 border-yellow-400">
                        <button onClick={() => setIsRulesModalVisible(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-['Lilita_One']">How to Play Spelling Safari</h2>
                        <ul className="text-left text-lg space-y-4 text-gray-700">
                            <li><span className="font-bold text-green-500">1. Unscramble the letters:</span> Click on the jumbled letters to build the word in the top box.</li>
                            <li><span className="font-bold text-blue-500">2. Clear and Try again:</span> If you make a mistake, hit the <span className="font-bold text-red-500">'Clear'</span> button to start over.</li>
                            <li><span className="font-bold text-purple-500">3. Submit your word:</span> When you think you have the right word, click <span className="font-bold text-green-500">'Submit'</span>.</li>
                            <li><span className="font-bold text-yellow-500">4. Score and Lives:</span> Each correct word increases your score! You have <span className="font-bold">3 lives</span>. Lose a life for each wrong guess.</li>
                            <li><span className="font-bold text-pink-500">5. Finish the list:</span> Get through all the words to win!</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
