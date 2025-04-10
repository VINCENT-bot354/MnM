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
        // Setup for question flow
        let currentQuestionIndex = 0;
        let answers = {};
        let selectedServices = [];
        let currentServiceIndex = 0;
        let currentCleaningType = '';

        // The main container for questions
        const questionContainer = document.getElementById("questions-container");

        // Initial step - Select services
        function displayServiceSelection() {
            // Reset
            questionContainer.innerHTML = '';
            document.getElementById('result').innerHTML = '';
            answers = {};
            selectedServices = [];
            currentServiceIndex = 0;
            updateProgressBar(0);

            // Create the service selection card
            const card = document.createElement("div");
            card.className = "card shadow-sm mb-4";
            
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
            
            const cardTitle = document.createElement("h5");
            cardTitle.className = "card-title mb-4";
            cardTitle.textContent = "What would you like to have cleaned?";
            cardBody.appendChild(cardTitle);
            
            const cardText = document.createElement("p");
            cardText.className = "card-text mb-3";
            cardText.textContent = "Select all that apply:";
            cardBody.appendChild(cardText);
            
            // Create checkboxes for each service type
            const services = ["House", "Sofa", "Car", "Tank", "Other"];
            const checkboxContainer = document.createElement("div");
            checkboxContainer.className = "mb-4";
            
            services.forEach(service => {
                const checkDiv = document.createElement("div");
                checkDiv.className = "form-check mb-2";
                
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "form-check-input";
                checkbox.id = `service-${service.toLowerCase()}`;
                checkbox.value = service;
                
                const label = document.createElement("label");
                label.className = "form-check-label";
                label.htmlFor = `service-${service.toLowerCase()}`;
                label.textContent = service;
                
                checkDiv.appendChild(checkbox);
                checkDiv.appendChild(label);
                checkboxContainer.appendChild(checkDiv);
            });
            
            cardBody.appendChild(checkboxContainer);
            
            // Continue button
            const continueBtn = document.createElement("button");
            continueBtn.className = "btn btn-primary w-100";
            continueBtn.textContent = "Continue";
            continueBtn.onclick = handleServiceSelection;
            
            cardBody.appendChild(continueBtn);
            card.appendChild(cardBody);
            questionContainer.appendChild(card);
        }

        // Handle the service selection
        function handleServiceSelection() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                // Show an error message if no service is selected
                alert("Please select at least one service");
                return;
            }
            
            // Store selected services
            checkboxes.forEach(checkbox => {
                selectedServices.push(checkbox.value);
            });
            
            // Start processing the first selected service
            processNextService();
        }

        // Process each selected service
        function processNextService() {
            if (currentServiceIndex < selectedServices.length) {
                const service = selectedServices[currentServiceIndex];
                answers[`service-${currentServiceIndex}`] = service;
                
                // Progress update
                updateProgressBar((currentServiceIndex / selectedServices.length) * 100);
                
                // Display questions specific to this service
                if (service === "House") {
                    displayHouseCleaningType();
                } else if (service === "Sofa") {
                    displaySofaQuestions();
                } else if (service === "Car") {
                    displayCarQuestions();
                } else {
                    // For Tank and Other, no additional questions needed
                    currentServiceIndex++;
                    processNextService();
                }
            } else {
                // All services processed, show the quote
                calculateQuote();
            }
        }

        // Display house cleaning type selection
        function displayHouseCleaningType() {
            questionContainer.innerHTML = '';
            
            const card = document.createElement("div");
            card.className = "card shadow-sm mb-4";
            
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
            
            const cardTitle = document.createElement("h5");
            cardTitle.className = "card-title mb-4";
            cardTitle.textContent = "What type of house cleaning do you need?";
            cardBody.appendChild(cardTitle);
            
            const optionsDiv = document.createElement("div");
            optionsDiv.className = "d-grid gap-2";
            
            const cleaningTypes = ["Standard", "Deep Cleaning", "Floor Only"];
            
            cleaningTypes.forEach(type => {
                const button = document.createElement("button");
                button.className = "btn btn-outline-primary";
                button.textContent = type;
                button.onclick = () => {
                    currentCleaningType = type;
                    answers[`house-cleaning-type-${currentServiceIndex}`] = type;
                    displayBathroomQuestion();
                };
                optionsDiv.appendChild(button);
            });
            
            cardBody.appendChild(optionsDiv);
            card.appendChild(cardBody);
            questionContainer.appendChild(card);
        }

        // Display bathroom question for house cleaning
        function displayBathroomQuestion() {
            questionContainer.innerHTML = '';
            
            const card = document.createElement("div");
            card.className = "card shadow-sm mb-4";
            
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
            
            const cardTitle = document.createElement("h5");
            cardTitle.className = "card-title mb-4";
            cardTitle.textContent = `How many bathrooms in the house? (${currentCleaningType})`;
            cardBody.appendChild(cardTitle);
            
            const optionsDiv = document.createElement("div");
            optionsDiv.className = "d-grid gap-2";
            
            const bathroomOptions = ["1", "2", "3", "4+"];
            
            bathroomOptions.forEach(option => {
                const button = document.createElement("button");
                button.className = "btn btn-outline-primary";
                button.textContent = option;
                button.onclick = () => {
                    answers[`bathrooms-${currentServiceIndex}`] = option;
                    currentServiceIndex++;
                    processNextService();
                };
                optionsDiv.appendChild(button);
            });
            
            cardBody.appendChild(optionsDiv);
            card.appendChild(cardBody);
            questionContainer.appendChild(card);
        }

        // Display sofa questions
        function displaySofaQuestions() {
            questionContainer.innerHTML = '';
            
            const card = document.createElement("div");
            card.className = "card shadow-sm mb-4";
            
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
            
            const cardTitle = document.createElement("h5");
            cardTitle.className = "card-title mb-4";
            cardTitle.textContent = "How many seats need cleaning?";
            cardBody.appendChild(cardTitle);
            
            const cardText = document.createElement("p");
            cardText.className = "card-text mb-3 text-muted";
            cardText.textContent = "Enter the total number of seats across all sofas";
            cardBody.appendChild(cardText);
            
            // Input for number of seats
            const inputGroup = document.createElement("div");
            inputGroup.className = "input-group mb-3";
            
            const input = document.createElement("input");
            input.type = "number";
            input.className = "form-control";
            input.id = "sofa-seats-input";
            input.min = "1";
            input.value = "1";
            
            const continueBtn = document.createElement("button");
            continueBtn.className = "btn btn-primary";
            continueBtn.textContent = "Continue";
            
            inputGroup.appendChild(input);
            inputGroup.appendChild(continueBtn);
            
            cardBody.appendChild(inputGroup);
            card.appendChild(cardBody);
            questionContainer.appendChild(card);
            
            // Handle continue button click
            continueBtn.onclick = () => {
                const seats = document.getElementById("sofa-seats-input").value;
                if (seats < 1) {
                    alert("Please enter at least 1 seat");
                    return;
                }
                
                answers[`sofa-seats-${currentServiceIndex}`] = seats;
                currentServiceIndex++;
                processNextService();
            };
        }

        // Display car questions
        function displayCarQuestions() {
            questionContainer.innerHTML = '';
            
            const card = document.createElement("div");
            card.className = "card shadow-sm mb-4";
            
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
            
            const cardTitle = document.createElement("h5");
            cardTitle.className = "card-title mb-4";
            cardTitle.textContent = "What type of car do you have?";
            cardBody.appendChild(cardTitle);
            
            const optionsDiv = document.createElement("div");
            optionsDiv.className = "d-grid gap-2";
            
            const carTypes = ["Small", "SUV", "Van"];
            
            carTypes.forEach(type => {
                const button = document.createElement("button");
                button.className = "btn btn-outline-primary";
                button.textContent = type;
                button.onclick = () => {
                    answers[`car-type-${currentServiceIndex}`] = type;
                    currentServiceIndex++;
                    processNextService();
                };
                optionsDiv.appendChild(button);
            });
            
            cardBody.appendChild(optionsDiv);
            card.appendChild(cardBody);
            questionContainer.appendChild(card);
        }

        // Function to update the progress bar
        function updateProgressBar(percentage) {
            const progressBar = document.getElementById('progress-bar');
            progressBar.style.width = percentage + '%';
            progressBar.setAttribute('aria-valuenow', percentage);
        }

        // Calculate the quote based on all selected services
        function calculateQuote() {
            let totalPrice = 0;
            let quoteDetails = [];
            
            // Update progress bar to 100%
            updateProgressBar(100);

            // Calculate price for each selected service
            for (let i = 0; i < selectedServices.length; i++) {
                const service = selectedServices[i];
                let servicePrice = 0;
                let serviceDetail = { service: service };
                
                if (service === "House") {
                    const cleaningType = answers[`house-cleaning-type-${i}`];
                    const bathrooms = answers[`bathrooms-${i}`];
                    servicePrice = pricingData["House"][cleaningType][bathrooms];
                    serviceDetail.type = cleaningType;
                    serviceDetail.bathrooms = bathrooms;
                    serviceDetail.price = servicePrice;
                } 
                else if (service === "Sofa") {
                    const seats = parseInt(answers[`sofa-seats-${i}`]);
                    servicePrice = Math.max(pricingData["Sofa"]["min_price"], seats * pricingData["Sofa"]["price_per_seat"]);
                    serviceDetail.seats = seats;
                    serviceDetail.price = servicePrice;
                } 
                else if (service === "Car") {
                    const carType = answers[`car-type-${i}`];
                    servicePrice = pricingData["Car"][carType];
                    serviceDetail.type = carType;
                    serviceDetail.price = servicePrice;
                } 
                else if (service === "Tank") {
                    servicePrice = pricingData["Tank"];
                    serviceDetail.price = servicePrice;
                }
                else if (service === "Other") {
                    servicePrice = pricingData["Other"];
                    serviceDetail.price = servicePrice;
                }
                
                totalPrice += servicePrice;
                quoteDetails.push(serviceDetail);
            }

            // Hide questions container
            questionContainer.innerHTML = '';
            
            // Prepare the details list for the quote
            let detailsHTML = '';
            quoteDetails.forEach(detail => {
                let serviceDescription = '';
                
                if (detail.service === "House") {
                    serviceDescription = `House (${detail.type}, ${detail.bathrooms} bathrooms)`;
                } else if (detail.service === "Sofa") {
                    serviceDescription = `Sofa (${detail.seats} seats)`;
                } else if (detail.service === "Car") {
                    serviceDescription = `Car (${detail.type})`;
                } else {
                    serviceDescription = detail.service;
                }
                
                detailsHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${serviceDescription}</span>
                        <span class="badge bg-primary rounded-pill">$${detail.price}</span>
                    </li>
                `;
            });
            
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
                            ${detailsHTML}
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <strong>Total</strong>
                                <strong>$${totalPrice}</strong>
                            </li>
                        </ul>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="displayServiceSelection()">Start Over</button>
                            <a href="#" class="btn btn-success">Book Now</a>
                        </div>
                    </div>
                </div>
            `;
        }

        // Start the calculator with service selection
        displayServiceSelection();
    }
});
