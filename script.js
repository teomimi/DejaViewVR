import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
   ========================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBP7BXunPg_brMRnPmZKMBYR6JM6loYMPE",

    authDomain:
        "dejaview-vr-tour.firebaseapp.com",

    projectId:
        "dejaview-vr-tour",

    storageBucket:
        "dejaview-vr-tour.firebasestorage.app",

    messagingSenderId:
        "965197167948",

    appId:
        "1:965197167948:web:795269e611c64edd83a3e9"

};


/* =========================
   INITIALIZE FIREBASE
   ========================= */

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


/* =========================
   CURRENT PAGE
   ========================= */

const currentPage =
    window.location.pathname
        .split("/")
        .pop();


/* =========================
   LOGIN
   ========================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                ).value;


            const password =
                document.getElementById(
                    "password"
                ).value;


            const loginMessage =
                document.getElementById(
                    "loginMessage"
                );


            try {

                loginMessage.textContent =
                    "Logging in...";


                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                window.location.href =
                    "Dejaview.html";


            } catch (error) {

                console.log(error);


                loginMessage.textContent =
                    "Invalid email or password.";

            }

        }
    );

}


/* =========================
   AUTHENTICATION CHECK
   ========================= */

onAuthStateChanged(
    auth,
    function(user) {

        if (
            currentPage === "index.html" ||
            currentPage === ""
        ) {

            if (!user) {

                window.location.href =
                    "login.html";

                return;

            }


            loadStudents();

            loadScenarios();

        }


        if (
            currentPage === "login.html"
        ) {

            if (user) {

                window.location.href =
                    "index.html";

            }

        }

    }
);


/* =========================
   LOGOUT
   ========================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmLogout) {

                return;

            }


            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.log(error);

            }

        }
    );

}


/* =========================================================
   STUDENT SYSTEM
   ========================================================= */

let students = [];

let editingStudentId = null;


/* =========================
   LOAD STUDENTS
   ========================= */

async function loadStudents() {

    const studentTable =
        document.getElementById(
            "studentTable"
        );


    if (!studentTable) {

        return;

    }


    studentTable.innerHTML =
        `
        <tr>
            <td colspan="5">
                Loading students...
            </td>
        </tr>
        `;


    try {

        const querySnapshot =
            await getDocs(
                collection(
                    db,
                    "students"
                )
            );


        students = [];


        querySnapshot.forEach(
            function(documentSnapshot) {

                students.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        updateStudentList();


    } catch (error) {

        console.log(error);


        studentTable.innerHTML =
            `
            <tr>
                <td colspan="5">
                    Unable to load students.
                </td>
            </tr>
            `;

    }

}


/* =========================
   DISPLAY STUDENTS
   ========================= */

function displayStudents(
    studentList
) {

    const studentTable =
        document.getElementById(
            "studentTable"
        );


    if (!studentTable) {

        return;

    }


    studentTable.innerHTML =
        "";


    if (
        studentList.length === 0
    ) {

        studentTable.innerHTML =
            `
            <tr>
                <td colspan="5">
                    No students found.
                </td>
            </tr>
            `;


        return;

    }


    studentList.forEach(
        function(student) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        student.studentIdNumber || ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.fullname || ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.username || ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.section || ""
                    )}
                </td>

                <td>

                    <button
                        class="edit-button"
                        data-id="${student.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        data-id="${student.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            studentTable.appendChild(
                row
            );

        }
    );


    attachEditButtons();

    attachDeleteButtons();

}


/* =========================
   STUDENT SEARCH AND SORT
   ========================= */

const searchStudent =
    document.getElementById(
        "searchStudent"
    );


const sortStudent =
    document.getElementById(
        "sortStudent"
    );


function updateStudentList() {

    const search =
        searchStudent
            ? searchStudent.value
                .toLowerCase()
                .trim()
            : "";


    let filteredStudents =
        students.filter(
            function(student) {

                const fullname =
                    String(
                        student.fullname || ""
                    )
                    .toLowerCase();


                const username =
                    String(
                        student.username || ""
                    )
                    .toLowerCase();


                const studentIdNumber =
                    String(
                        student.studentIdNumber || ""
                    )
                    .toLowerCase();


                const section =
                    String(
                        student.section || ""
                    )
                    .toLowerCase();


                return (

                    studentIdNumber.includes(
                        search
                    )

                    ||

                    fullname.includes(
                        search
                    )

                    ||

                    username.includes(
                        search
                    )

                    ||

                    section.includes(
                        search
                    )

                );

            }
        );


    const sortValue =
        sortStudent
            ? sortStudent.value
            : "default";


    filteredStudents.sort(
        function(a, b) {

            let valueA = "";

            let valueB = "";


            if (
                sortValue === "id-asc" ||
                sortValue === "id-desc"
            ) {

                valueA =
                    String(
                        a.studentIdNumber || ""
                    )
                    .toLowerCase();


                valueB =
                    String(
                        b.studentIdNumber || ""
                    )
                    .toLowerCase();

            }


            if (
                sortValue === "name-asc" ||
                sortValue === "name-desc"
            ) {

                valueA =
                    String(
                        a.fullname || ""
                    )
                    .toLowerCase();


                valueB =
                    String(
                        b.fullname || ""
                    )
                    .toLowerCase();

            }


            if (
                sortValue === "section-asc" ||
                sortValue === "section-desc"
            ) {

                valueA =
                    String(
                        a.section || ""
                    )
                    .toLowerCase();


                valueB =
                    String(
                        b.section || ""
                    )
                    .toLowerCase();

            }


            if (
                sortValue === "id-asc" ||
                sortValue === "name-asc" ||
                sortValue === "section-asc"
            ) {

                return valueA.localeCompare(
                    valueB
                );

            }


            if (
                sortValue === "id-desc" ||
                sortValue === "name-desc" ||
                sortValue === "section-desc"
            ) {

                return valueB.localeCompare(
                    valueA
                );

            }


            return 0;

        }
    );


    displayStudents(
        filteredStudents
    );

}


/* =========================
   SEARCH EVENT
   ========================= */

if (searchStudent) {

    searchStudent.addEventListener(
        "input",
        function() {

            updateStudentList();

        }
    );

}


/* =========================
   SORT EVENT
   ========================= */

if (sortStudent) {

    sortStudent.addEventListener(
        "change",
        function() {

            updateStudentList();

        }
    );

}


/* =========================
   EDIT BUTTONS
   ========================= */

function attachEditButtons() {

    document
        .querySelectorAll(
            ".edit-button"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        editStudent(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================
   DELETE BUTTONS
   ========================= */

function attachDeleteButtons() {

    document
        .querySelectorAll(
            ".delete-button"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        deleteStudent(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   STUDENT MODAL
   ========================================================= */

const studentModal =
    document.getElementById(
        "studentModal"
    );


const addStudentButton =
    document.getElementById(
        "addStudentButton"
    );


const closeModal =
    document.getElementById(
        "closeModal"
    );


if (addStudentButton) {

    addStudentButton.addEventListener(
        "click",
        function() {

            editingStudentId =
                null;


            document.getElementById(
                "modalTitle"
            ).textContent =
                "Add Student";


            document.getElementById(
                "studentForm"
            ).reset();


            studentModal.style.display =
                "block";

        }
    );

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        function() {

            studentModal.style.display =
                "none";

        }
    );

}


/* =========================
   STUDENT FORM
   ========================= */

const studentForm =
    document.getElementById(
        "studentForm"
    );


if (studentForm) {

    studentForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const fullname =
                document.getElementById(
                    "studentFullname"
                ).value.trim();


            const username =
                document.getElementById(
                    "studentUsername"
                ).value.trim();


            const password =
                document.getElementById(
                    "studentPassword"
                ).value;


            const studentIdNumber =
                document.getElementById(
                    "studentIdNumber"
                ).value.trim();


            const section =
                document.getElementById(
                    "studentSection"
                ).value.trim();


            const studentData = {

                fullname:
                    fullname,

                password:
                    password,

                section:
                    section,

                studentIdNumber:
                    studentIdNumber,

                username:
                    username

            };


            try {

                if (
                    editingStudentId
                ) {

                    const studentReference =
                        doc(
                            db,
                            "students",
                            editingStudentId
                        );


                    await updateDoc(
                        studentReference,
                        studentData
                    );


                    alert(
                        "Student updated successfully."
                    );


                } else {

                    await addDoc(
                        collection(
                            db,
                            "students"
                        ),
                        studentData
                    );


                    alert(
                        "Student added successfully."
                    );

                }


                studentModal.style.display =
                    "none";


                studentForm.reset();


                editingStudentId =
                    null;


                await loadStudents();


            } catch (error) {

                console.log(error);


                alert(
                    "Unable to save student."
                );

            }

        }
    );

}


/* =========================
   EDIT STUDENT
   ========================= */

function editStudent(id) {

    const student =
        students.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!student) {

        return;

    }


    editingStudentId =
        id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Student";


    document.getElementById(
        "studentFullname"
    ).value =
        student.fullname || "";


    document.getElementById(
        "studentUsername"
    ).value =
        student.username || "";


    document.getElementById(
        "studentPassword"
    ).value =
        student.password || "";


    document.getElementById(
        "studentIdNumber"
    ).value =
        student.studentIdNumber || "";


    document.getElementById(
        "studentSection"
    ).value =
        student.section || "";


    studentModal.style.display =
        "block";

}


/* =========================
   DELETE STUDENT
   ========================= */

async function deleteStudent(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "students",
                id
            )
        );


        await loadStudents();


        alert(
            "Student deleted successfully."
        );


    } catch (error) {

        console.log(error);


        alert(
            "Unable to delete student."
        );

    }

}


/* =========================================================
   SCENARIO MODULE
   ========================================================= */

let scenarios = [];

let editingScenarioId = null;


/* =========================
   LOAD SCENARIOS
   ========================= */

async function loadScenarios() {

    const scenarioList =
        document.getElementById(
            "scenarioList"
        );


    if (!scenarioList) {

        return;

    }


    scenarioList.innerHTML =
        `
        <p class="loading-message">
            Loading scenarios...
        </p>
        `;


    try {

        const querySnapshot =
            await getDocs(
                collection(
                    db,
                    "Scenarios_tbl"
                )
            );


        scenarios = [];


        querySnapshot.forEach(
            function(documentSnapshot) {

                scenarios.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        displayScenarios(
            scenarios
        );


    } catch (error) {

        console.log(error);


        scenarioList.innerHTML =
            `
            <p class="no-data-message">
                Unable to load scenarios.
            </p>
            `;

    }

}


/* =========================
   DISPLAY SCENARIOS
   ========================= */

function displayScenarios(
    scenarioListData
) {

    const scenarioList =
        document.getElementById(
            "scenarioList"
        );


    if (!scenarioList) {

        return;

    }


    scenarioList.innerHTML =
        "";


    if (
        scenarioListData.length === 0
    ) {

        scenarioList.innerHTML =
            `
            <p class="no-data-message">
                No scenario questions found.
            </p>
            `;


        return;

    }


    scenarioListData.forEach(
        function(scenario) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "scenario-card";


            const options =
                Array.isArray(
                    scenario.options
                )
                    ? scenario.options
                    : [];


            let optionsHTML =
                "";


            options.forEach(
                function(option, index) {

                    optionsHTML += `

                        <div class="option-card">

                            <strong>
                                Option ${index + 1}
                            </strong>

                            <p class="option-text">
                                ${escapeHTML(
                                    option.text || ""
                                )}
                            </p>

                            <p class="option-score">
                                Score Weight:
                                ${escapeHTML(
                                    String(
                                        option.scoreWeight ?? 0
                                    )
                                )}
                            </p>

                            <p class="option-reaction">
                                Reaction:
                                ${escapeHTML(
                                    option.taglishReaction || ""
                                )}
                            </p>

                        </div>

                    `;

                }
            );


            card.innerHTML = `

                <div class="scenario-header">

                    <div>

                        <p class="scenario-question-id">
                            Question ID:
                            ${escapeHTML(
                                scenario.questionID || ""
                            )}
                        </p>

                        <p class="scenario-question">
                            ${escapeHTML(
                                scenario.questionText || ""
                            )}
                        </p>

                        <p class="scenario-info">

                            <strong>
                                Speaker:
                            </strong>

                            ${escapeHTML(
                                scenario.speakerNPC || ""
                            )}

                            &nbsp; | &nbsp;

                            <strong>
                                Destination:
                            </strong>

                            ${escapeHTML(
                                scenario.destinationID || ""
                            )}

                        </p>

                    </div>


                    <div class="scenario-actions">

                        <button
                            class="scenario-edit-button"
                            data-id="${scenario.id}"
                        >
                            Edit
                        </button>

                        <button
                            class="scenario-delete-button"
                            data-id="${scenario.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>


                <div class="options-container">

                    <h3>
                        Answer Options
                    </h3>

                    ${optionsHTML}

                </div>

            `;


            scenarioList.appendChild(
                card
            );

        }
    );


    attachScenarioEditButtons();

    attachScenarioDeleteButtons();

}


/* =========================
   SCENARIO SEARCH
   ========================= */

const searchScenario =
    document.getElementById(
        "searchScenario"
    );


if (searchScenario) {

    searchScenario.addEventListener(
        "input",
        function() {

            const search =
                searchScenario.value
                    .toLowerCase()
                    .trim();


            const filteredScenarios =
                scenarios.filter(
                    function(scenario) {

                        const question =
                            (
                                scenario.questionText ||
                                ""
                            )
                            .toLowerCase();


                        const questionID =
                            (
                                scenario.questionID ||
                                ""
                            )
                            .toLowerCase();


                        const speaker =
                            (
                                scenario.speakerNPC ||
                                ""
                            )
                            .toLowerCase();


                        const destination =
                            (
                                scenario.destinationID ||
                                ""
                            )
                            .toLowerCase();


                        return (

                            question.includes(
                                search
                            )

                            ||

                            questionID.includes(
                                search
                            )

                            ||

                            speaker.includes(
                                search
                            )

                            ||

                            destination.includes(
                                search
                            )

                        );

                    }
                );


            displayScenarios(
                filteredScenarios
            );

        }
    );

}


/* =========================
   SCENARIO EDIT BUTTONS
   ========================= */

function attachScenarioEditButtons() {

    document
        .querySelectorAll(
            ".scenario-edit-button"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        editScenario(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================
   SCENARIO DELETE BUTTONS
   ========================= */

function attachScenarioDeleteButtons() {

    document
        .querySelectorAll(
            ".scenario-delete-button"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        deleteScenario(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================
   SCENARIO MODAL
   ========================= */

const scenarioModal =
    document.getElementById(
        "scenarioModal"
    );


const addScenarioButton =
    document.getElementById(
        "addScenarioButton"
    );


const closeScenarioModal =
    document.getElementById(
        "closeScenarioModal"
    );


if (addScenarioButton) {

    addScenarioButton.addEventListener(
        "click",
        function() {

            editingScenarioId =
                null;


            document.getElementById(
                "scenarioModalTitle"
            ).textContent =
                "Add Scenario";


            document.getElementById(
                "scenarioForm"
            ).reset();


            scenarioModal.style.display =
                "block";

        }
    );

}


if (closeScenarioModal) {

    closeScenarioModal.addEventListener(
        "click",
        function() {

            scenarioModal.style.display =
                "none";

        }
    );

}


/* =========================
   CLOSE MODALS
   ========================= */

window.addEventListener(
    "click",
    function(event) {

        if (
            event.target === studentModal
        ) {

            studentModal.style.display =
                "none";

        }


        if (
            event.target === scenarioModal
        ) {

            scenarioModal.style.display =
                "none";

        }

    }
);


/* =========================
   SCENARIO FORM
   ========================= */

const scenarioForm =
    document.getElementById(
        "scenarioForm"
    );


if (scenarioForm) {

    scenarioForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const questionID =
                document.getElementById(
                    "scenarioQuestionID"
                ).value.trim();


            const questionText =
                document.getElementById(
                    "scenarioQuestionText"
                ).value.trim();


            const speakerNPC =
                document.getElementById(
                    "scenarioSpeakerNPC"
                ).value.trim();


            const destinationID =
                document.getElementById(
                    "scenarioDestinationID"
                ).value.trim();


            const options = [

                {

                    text:
                        document.getElementById(
                            "optionText1"
                        ).value.trim(),

                    scoreWeight:
                        Number(
                            document.getElementById(
                                "optionScore1"
                            ).value
                        ),

                    taglishReaction:
                        document.getElementById(
                            "optionReaction1"
                        ).value.trim()

                },

                {

                    text:
                        document.getElementById(
                            "optionText2"
                        ).value.trim(),

                    scoreWeight:
                        Number(
                            document.getElementById(
                                "optionScore2"
                            ).value
                        ),

                    taglishReaction:
                        document.getElementById(
                            "optionReaction2"
                        ).value.trim()

                },

                {

                    text:
                        document.getElementById(
                            "optionText3"
                        ).value.trim(),

                    scoreWeight:
                        Number(
                            document.getElementById(
                                "optionScore3"
                            ).value
                        ),

                    taglishReaction:
                        document.getElementById(
                            "optionReaction3"
                        ).value.trim()

                }

            ];


            try {

                if (
                    editingScenarioId
                ) {

                    const scenarioReference =
                        doc(
                            db,
                            "Scenarios_tbl",
                            editingScenarioId
                        );


                    await updateDoc(
                        scenarioReference,
                        {

                            questionID:
                                questionID,

                            questionText:
                                questionText,

                            speakerNPC:
                                speakerNPC,

                            destinationID:
                                destinationID,

                            options:
                                options,

                            updatedAt:
                                serverTimestamp(),

                            updatedBy:
                                auth.currentUser
                                    ? auth.currentUser.uid
                                    : ""

                        }
                    );


                    alert(
                        "Scenario updated successfully."
                    );


                } else {

                    await addDoc(
                        collection(
                            db,
                            "Scenarios_tbl"
                        ),
                        {

                            questionID:
                                questionID,

                            questionText:
                                questionText,

                            speakerNPC:
                                speakerNPC,

                            destinationID:
                                destinationID,

                            options:
                                options,

                            createdAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp(),

                            updatedBy:
                                auth.currentUser
                                    ? auth.currentUser.uid
                                    : ""

                        }
                    );


                    alert(
                        "Scenario added successfully."
                    );

                }


                scenarioModal.style.display =
                    "none";


                scenarioForm.reset();


                editingScenarioId =
                    null;


                await loadScenarios();


            } catch (error) {

                console.log(error);


                alert(
                    "Unable to save scenario."
                );

            }

        }
    );

}


/* =========================
   EDIT SCENARIO
   ========================= */

function editScenario(id) {

    const scenario =
        scenarios.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!scenario) {

        return;

    }


    editingScenarioId =
        id;


    document.getElementById(
        "scenarioModalTitle"
    ).textContent =
        "Edit Scenario";


    document.getElementById(
        "scenarioQuestionID"
    ).value =
        scenario.questionID || "";


    document.getElementById(
        "scenarioQuestionText"
    ).value =
        scenario.questionText || "";


    document.getElementById(
        "scenarioSpeakerNPC"
    ).value =
        scenario.speakerNPC || "";


    document.getElementById(
        "scenarioDestinationID"
    ).value =
        scenario.destinationID || "";


    const options =
        Array.isArray(
            scenario.options
        )
            ? scenario.options
            : [];


    const option1 =
        options[0] || {};


    const option2 =
        options[1] || {};


    const option3 =
        options[2] || {};


    document.getElementById(
        "optionText1"
    ).value =
        option1.text || "";


    document.getElementById(
        "optionScore1"
    ).value =
        option1.scoreWeight ?? "";


    document.getElementById(
        "optionReaction1"
    ).value =
        option1.taglishReaction || "";


    document.getElementById(
        "optionText2"
    ).value =
        option2.text || "";


    document.getElementById(
        "optionScore2"
    ).value =
        option2.scoreWeight ?? "";


    document.getElementById(
        "optionReaction2"
    ).value =
        option2.taglishReaction || "";


    document.getElementById(
        "optionText3"
    ).value =
        option3.text || "";


    document.getElementById(
        "optionScore3"
    ).value =
        option3.scoreWeight ?? "";


    document.getElementById(
        "optionReaction3"
    ).value =
        option3.taglishReaction || "";


    scenarioModal.style.display =
        "block";

}


/* =========================
   DELETE SCENARIO
   ========================= */

async function deleteScenario(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this scenario?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "Scenarios_tbl",
                id
            )
        );


        await loadScenarios();


        alert(
            "Scenario deleted successfully."
        );


    } catch (error) {

        console.log(error);


        alert(
            "Unable to delete scenario."
        );

    }

}


/* =========================
   SECURITY HELPER
   ========================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
