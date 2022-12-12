"use strict";
//Drag & Drop interface
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//project class
var projectstatus;
(function (projectstatus) {
    projectstatus[projectstatus["Active"] = 0] = "Active";
    projectstatus[projectstatus["Finished"] = 1] = "Finished";
})(projectstatus || (projectstatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListeners(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, desc, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, desc, numOfPeople, projectstatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status === newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
function validate(validateValue) {
    let isValid = true;
    if (validateValue.required) {
        isValid = isValid && validateValue.toString().trim().length !== 0;
    }
    if (validateValue.maxLength != null && typeof (validateValue.value) == 'string') {
        isValid = isValid && validateValue.value.length < validateValue.maxLength;
    }
    if (validateValue.minLength != null && typeof (validateValue.value) == 'string') {
        isValid = isValid && validateValue.value.length > validateValue.minLength;
    }
    if (validateValue.max != null && typeof (validateValue.value) == 'number') {
        isValid = isValid && validateValue.value < validateValue.max;
    }
    if (validateValue.min != null && typeof (validateValue.value) == 'number') {
        isValid = isValid && validateValue.value > validateValue.min;
    }
    return isValid;
}
//AutoBind
function autoBind(target, methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjastedDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjastedDescriptor;
}
// Component
class Component {
    constructor(tempId, hostId, insertAtStart, newElementId) {
        this.holderTemp = document.getElementById(tempId);
        this.hostTemp = document.getElementById(hostId);
        const importedList = document.importNode(this.holderTemp.content, true);
        this.element = importedList.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.Attach(insertAtStart);
    }
    Attach(insertAtBeginning) {
        this.hostTemp.insertAdjacentElement(insertAtBeginning === true ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ProjectItem extends Component {
    get Persons() {
        if (this.project.people === 1) {
            return "1 Person";
        }
        else {
            return `${this.project.people}  Persons`;
        }
    }
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(_) {
    }
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title,
            this.element.querySelector('h3').textContent = this.Persons + 'Assigned';
        this.element.querySelector('p').textContent = this.project.description;
    }
}
__decorate([
    autoBind
], ProjectItem.prototype, "dragStartHandler", null);
//Project List Class
class ProjectList extends Component {
    constructor(type) {
        super('project-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === ('text/plain')) {
            event.preventDefault();
            const listEl = this.element.querySelector('ul');
            listEl.classList.add('droppable');
        }
    }
    dropHandler(event) {
        const prjId = event.dataTransfer.getData('text/plain');
        projectState.moveProject(prjId, this.type === 'active' ? projectstatus.Active : projectstatus.Finished);
    }
    dragLeaveHandler(_) {
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    }
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        projectState.addListeners((projects) => {
            const relaventProject = projects.filter(prjt => {
                if (this.type === 'active') {
                    return prjt.status === projectstatus.Active;
                }
                return prjt.status === projectstatus.Finished;
            });
            this.assignProjects = relaventProject;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}- projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' ' + 'PROJECTS';
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}- projects-list`);
        listEl.innerHTML = '';
        for (const prjItem of this.assignProjects) {
            new ProjectItem(this.element.querySelector('ul').id, prjItem);
        }
    }
}
__decorate([
    autoBind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    autoBind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    autoBind
], ProjectList.prototype, "dragLeaveHandler", null);
// Project Class 
class ProjectInput extends Component {
    constructor() {
        super("project-input", 'app', true, 'user-input');
        this.titleEl = this.element.querySelector('#title');
        this.descriptionEl = this.element.querySelector('#description');
        this.peopleEl = this.element.querySelector('#people');
        this.configure();
    }
    clearInput() {
        this.titleEl.value = '';
        this.peopleEl.value = '';
        this.descriptionEl.value = '';
    }
    getInputValue() {
        const titleValue = this.titleEl.value;
        const descriptionValue = this.descriptionEl.value;
        const peopleValue = this.peopleEl.value;
        const validTitle = {
            value: titleValue,
            required: true,
            minLength: 3
        };
        const validDescription = {
            value: descriptionValue,
            required: true,
            minLength: 5
        };
        const validPeople = {
            value: +peopleValue,
            required: true,
            min: 1,
            max: 10
        };
        if (!validate(validTitle) || !validate(validDescription) || !validate(validPeople)) {
            alert('Invalid Input Value');
            return;
        }
        else {
            return [titleValue, descriptionValue, +peopleValue];
        }
    }
    handleSubmit(event) {
        event.preventDefault();
        const userInput = this.getInputValue();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInput();
        }
    }
    renderContent() {
    }
    configure() {
        this.element.addEventListener('submit', this.handleSubmit);
    }
}
__decorate([
    autoBind
], ProjectInput.prototype, "handleSubmit", null);
const project = new ProjectInput();
const activePrj = new ProjectList('active');
const finishedPrj = new ProjectList('finished');
