// Quote Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Fetch the pricing data from the server
    fetch('/static/data/pricing.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Initialize the calculator with the pricing data
            initializeCalculator(data);
        })
        .catch(error => {
            console.error('Error loading pricing data:', error);
            document.getElementById('error-message').textContent = 
                'Failed to load pricing data. Please refresh the page or contact support.';
            document.getElementById('error-container').classList.remove('d-none');
        });

    // Initialize the calculator with pricing data
    function initializeCalculator(pricingData) {
        // Question Data
        const questions = [
            {
                question: "What do you want cleaned?",
                options: ["House", "Tank", "Car", "Sofa"],
                fieldName: "service-type"
            },
            {
                question: "How many bathrooms in the house?",
                options: ["1", "2", "3", "4+"],
                fieldName: "bathrooms",
                dependsOn: "House"
            },
            {
                question: "How many seats in the sofa?",
                options: ["1 seat", "2 seats", "3 seats", "More"],
                fieldName: "sofa-seats",
                dependsOn: "Sofa"
            },
            {
                question: "What type of car?",
                options: ["Small", "SUV", "Van"],
                fieldName: "car-type",
                dependsOn: "Car"
            }
        ];

        let currentQuestionIndex = 0;
        let answers = {};

        // Display first question
        displayQuestion();

        // Function to display a question
        function displayQuestion() {
            const questionContainer = document.getElementById("questions-container");
            questionContainer.innerHTML = '';

            // Hide any previous result
            document.getElementById('result').innerHTML = '';
            
            // Reset progress when starting over
            if (currentQuestionIndex === 0) {
                answers = {};
                updateProgressBar(0);
            }

            if (currentQuestionIndex < questions.length) {
                const question = questions[currentQuestionIndex];
                
                // Skip questions that don't apply based on previous answers
                if (question.dependsOn && answers["service-type"] !== question.dependsOn) {
                    currentQuestionIndex++;
                    
                    // If we've skipped the last question, calculate the quote
                    if (currentQuestionIndex >= questions.length) {
                        calculateQuote();
                        return;
                    }
                    
                    // Otherwise, show the next question
                    return displayQuestion();
                }
                
                const questionDiv = document.createElement("div");
                questionDiv.className = "card shadow-sm mb-4";
                
                const cardBody = document.createElement("div");
                cardBody.className = "card-body";
                
                const questionTitle = document.createElement("h5");
                questionTitle.className = "card-title mb-4";
                questionTitle.textContent = question.question;
                cardBody.appendChild(questionTitle);
                
                const optionsDiv = document.createElement("div");
                optionsDiv.className = "d-grid gap-2";
                
                question.options.forEach(option => {
                    const optionButton = document.createElement("button");
                    optionButton.className = "btn btn-outline-primary";
                    optionButton.textContent = option;
                    optionButton.setAttribute('data-value', option);
                    optionButton.onclick = () => handleAnswer(option);
                    optionsDiv.appendChild(optionButton);
                });
                
                cardBody.appendChild(optionsDiv);
                questionDiv.appendChild(cardBody);
                questionContainer.appendChild(questionDiv);
                
                // Update progress bar
                const progress = ((currentQuestionIndex) / questions.length) * 100;
                updateProgressBar(progress);
            }
        }

        // Function to update the progress bar
        function updateProgressBar(percentage) {
            const progressBar = document.getElementById('progress-bar');
            progressBar.style.width = percentage + '%';
            progressBar.setAttribute('aria-valuenow', percentage);
        }

        // Handle Answer
        function handleAnswer(answer) {
            const currentQuestion = questions[currentQuestionIndex];
            
            // Store answer with the field name as the key
            answers[currentQuestion.fieldName] = answer;
            
            if (currentQuestion.fieldName === "service-type") {
                // Also store for compatibility with the original logic
                answers["What do you want cleaned?"] = answer;
            } else if (currentQuestion.fieldName === "bathrooms") {
                answers["How many bathrooms in the house?"] = answer;
            } else if (currentQuestion.fieldName === "sofa-seats") {
                answers["How many seats in the sofa?"] = answer;
            } else if (currentQuestion.fieldName === "car-type") {
                answers["What type of car?"] = answer;
            }
            
            // Move to next question
            currentQuestionIndex++;
            
            // Show result if it's the last question
            if (currentQuestionIndex >= questions.length) {
                calculateQuote();
            } else {
                displayQuestion();
            }
        }

        // Calculate the quote based on the stored prices
        function calculateQuote() {
            let totalPrice = 0;
            
            // Update progress bar to 100%
            updateProgressBar(100);

            // Logic to calculate the price based on user answers
            const serviceType = answers["service-type"];
            
            if (serviceType === "House") {
                const bathrooms = answers["bathrooms"];
                totalPrice += pricingData["House"][bathrooms] || 0;
            } else if (serviceType === "Sofa") {
                const seats = answers["sofa-seats"];
                totalPrice += pricingData["Sofa"][seats] || 0;
            } else if (serviceType === "Car") {
                const carType = answers["car-type"];
                totalPrice += pricingData["Car"][carType] || 0;
            } else if (serviceType === "Tank") {
                totalPrice += pricingData["Tank"];
            }

            // Hide questions container
            document.getElementById("questions-container").innerHTML = '';
            
            // Show the result
            const resultContainer = document.getElementById("result");
            resultContainer.innerHTML = `
                <div class="card border-success mb-4 shadow">
                    <div class="card-header bg-success text-white">
                        <h5 class="m-0">Your Quote</h5>
                    </div>
                    <div class="card-body">
                        <h2 class="card-title text-center mb-4">$${totalPrice}</h2>
                        <p class="card-text">Thank you for using our quote calculator! Below is a summary of your selections:</p>
                        <ul class="list-group list-group-flush mb-4">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Service Type:</span>
                                <strong>${serviceType}</strong>
                            </li>
                            ${serviceType === "House" ? 
                                `<li class="list-group-item d-flex justify-content-between">
                                    <span>Bathrooms:</span>
                                    <strong>${answers["bathrooms"]}</strong>
                                </li>` : ''}
                            ${serviceType === "Sofa" ? 
                                `<li class="list-group-item d-flex justify-content-between">
                                    <span>Sofa Size:</span>
                                    <strong>${answers["sofa-seats"]}</strong>
                                </li>` : ''}
                            ${serviceType === "Car" ? 
                                `<li class="list-group-item d-flex justify-content-between">
                                    <span>Car Type:</span>
                                    <strong>${answers["car-type"]}</strong>
                                </li>` : ''}
                        </ul>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="location.reload()">Start Over</button>
                            <a href="#" class="btn btn-success">Book Now</a>
                        </div>
                    </div>
                </div>
            `;
        }
    }
});
