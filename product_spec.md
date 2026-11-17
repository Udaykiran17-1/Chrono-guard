# SKILLBRIDGE

## Master Product & Development Specification



**Product:** SkillBridge

**Category:** Student Talent Discovery and Collaboration Platform

**Application Type:** Responsive Web Application

**Initial Target:** University students and student organisations

**Development Approach:** AI-assisted, milestone-based development



**Product tagline:** Connecting Student Skills with Real Opportunities.



---



# 1. PRODUCT VISION



## 1.1 What is SkillBridge?



SkillBridge is a campus-focused platform that connects students who possess particular skills with students, individuals and organisations that need those skills.



The platform provides a structured environment where students can:



Discover talented students.
Showcase their skills and previous work.
Find freelance and collaborative opportunities.
Publish projects and requirements.
Apply for projects.
Select suitable collaborators.
Establish clear project agreements.
Track project progress.
Build a record of successful collaborations.


Student organisations can use SkillBridge to discover talent, manage collaborations and preserve freelancer information across committee transitions.



## 1.2 The Problem We Solve



Students currently depend heavily on informal networks such as WhatsApp groups, friends, seniors and personal contacts to discover skilled people.



This creates several problems:



Skilled students remain undiscovered.
People struggle to verify someone's actual capabilities.
Interested candidates may not be available.
Freelancers struggle to find suitable opportunities.
Project requirements are often unclear.
Payment and revision expectations are not established properly.
Communication becomes fragmented.
Student organisations lose useful contacts and collaboration records when committees change.


SkillBridge aims to address these problems through a unified platform.



## 1.3 Product Objectives



The platform must:



Make student talent discoverable.
Make skill verification easier.
Connect project requirements with suitable people.
Help freelancers discover opportunities.
Encourage transparent collaboration.
Reduce misunderstandings.
Preserve collaboration history.
Improve continuity for student organisations.


---



# 2. USER TYPES AND PERMISSIONS



There are four main account categories.



## 2.1 Student



A student account must support two capabilities:



### A. Skill Seeker



A student who needs another person's skills.



Capabilities:

Discover student profiles.
Search by skills.
View portfolios.
View previous collaboration records.
Post project requirements.
Receive applications.
Review applicants.
Select collaborators.
Create project agreements.
Track projects.
Submit reviews.


### B. Student Freelancer



A student who offers skills.



Capabilities:

Create a professional profile.
List multiple skills.
Upload portfolio items.
Display previous work.
Set availability.
Discover projects.
Apply for opportunities.
Communicate project proposals.
Accept or reject offers.
Manage active projects.
Track project progress.
Maintain collaboration history.


IMPORTANT:



A student must not be restricted to one role.



The same student can hire someone for one project and work as a freelancer on another.



Do not create separate student accounts for these two capabilities.



## 2.2 Club Representative



A club representative manages an organisation's activities.



Capabilities:

Create or manage an organisation profile.
Post project requirements.
Search student talent.
Review applications.
Select freelancers.
Manage projects.
Maintain previous freelancer records.
Record project costs.
Record collaboration feedback.
Maintain handover information.
Manage organisation members, subject to permissions.


## 2.3 Organisation Administrator



An organisation administrator is responsible for the organisation's SkillBridge account.



Capabilities:

Invite committee members.
Assign roles.
Remove former members.
Transfer administrative ownership.
View organisation project history.
Maintain freelancer records.
Manage handover information.


## 2.4 Platform Administrator



The platform administrator manages SkillBridge itself.



Capabilities:

View registered accounts.
Manage reported users.
Review reported content.
Suspend or deactivate accounts.
Manage skill categories.
Manage platform settings.
Review organisation registrations.
Monitor platform activity.


Platform administration must be separate from ordinary student and organisation permissions.



---



# 3. REGISTRATION AND AUTHENTICATION



## 3.1 Landing Page



Create a professional landing page.



It must contain:



### Navigation Bar

SkillBridge logo.
Home.
Explore Talent.
Find Projects.
How It Works.
Login.
Get Started.


Some navigation options may require authentication.



### Hero Section



Main heading:



"Your Skills Deserve the Right Opportunity."



Supporting text:



"Discover talented students, showcase your capabilities and collaborate on meaningful projects within your campus community."



Primary button:

"Explore Talent"



Secondary button:

"Join SkillBridge"



### Additional Sections



How SkillBridge works.
Discover student talent.
Find exciting projects.
Benefits for freelancers.
Benefits for clubs.
Frequently asked questions.
Footer with contact, policies and navigation.


The landing page must communicate the product clearly without overwhelming visitors.



## 3.2 Registration



Registration must contain:



Full name.
University email.
Password.
Confirm password.
University.
Department.
Course or programme.
Current academic year.
Profile photograph (optional initially).
Agreement to terms and privacy policy.


Validate all required fields.



Email verification must be supported.



If the MVP is initially restricted to one university, provide a configurable university eligibility rule rather than hardcoding assumptions throughout the application.



## 3.3 Login



Login must support:



University email.
Password.
Remember session.
Forgot password.
Email verification status.


Provide secure authentication.



Never store plain-text passwords.



Use Supabase Auth rather than implementing password storage manually.



## 3.4 Profile Setup



After registration, guide the student through profile completion.



Ask the student:



Are you interested in offering your skills?
Are you looking for people with particular skills?
Which skills do you possess?
Do you have previous projects?
Would you like to showcase a portfolio?


Both seeker and freelancer capabilities must be enabled by default.



---



# 4. STUDENT PROFILE SYSTEM



Every student must have a professional profile.



## 4.1 Profile Information



Display:



Profile photograph.
Full name.
University.
Department.
Academic year.
Short biography.
Skills.
Areas of interest.
Portfolio.
Previous projects.
Availability.
Collaboration history.
Reviews.


## 4.2 Skills



Students can add multiple skills.



Examples:



Technical:

C++.
Python.
Java.
JavaScript.
React.
Node.js.
SQL.
UI/UX Design.
Machine Learning.
Web Development.


Creative:

Graphic Design.
Video Editing.
Motion Graphics.
Photography.
Content Writing.
Animation.


Other:

Public Speaking.
Event Management.
Presentation Design.
Marketing.


Allow administrators to manage skill categories.



Students must be able to add an unlisted skill through a controlled request process.



## 4.3 Skill Proficiency



Allow students to describe their experience level:



Beginner.
Intermediate.
Advanced.


These are self-reported levels, not verified certifications.



Clearly distinguish self-reported skills from independently verified achievements.



## 4.4 Portfolio



Students must be able to add portfolio entries.



Each entry should contain:



Project title.
Description.
Skills used.
Project category.
Thumbnail.
External project link.
GitHub link, where applicable.
Date or year.
Optional supporting files.


Allow students to edit and delete their own entries.



Validate uploaded files and external links.



---



# 5. TALENT DISCOVERY SYSTEM



This is one of the most important modules.



## 5.1 Talent Discovery Page



Create a searchable directory of student profiles.



Each student card must display:



Profile image.
Name.
Department.
Academic year.
Main skills.
Short introduction.
Availability status.
View Profile button.


## 5.2 Search



Allow searches using:



Student name.
Skill name.
Technology.
Department.
Project category.


## 5.3 Filters



Provide filters for:



Skill category.
Specific skills.
Department.
Academic year.
Availability.
Experience level.


Allow multiple filters simultaneously.



Provide a clear-all-filters option.



## 5.4 Sorting



Support:



Recently active.
Recently joined.
Relevant skills.
Availability.


Do not display fabricated popularity scores or unverified ratings.



## 5.5 Profile Actions



Depending on the user's permissions, provide:



View Profile.
Contact.
Invite to Project.
Report Profile.


Only authenticated users should access protected contact functionality.



---



# 6. PROJECT POSTING SYSTEM



Students and authorised club representatives must be able to publish project opportunities.



## 6.1 Create Project



Required fields:



Project title.
Project description.
Required skills.
Project category.
Expected deliverables.
Deadline.
Estimated duration.
Budget type.
Budget range.
Number of collaborators required.
Additional requirements.


Budget types:



Fixed budget.
Negotiable.
Unpaid collaboration.
Volunteer opportunity.
Other clearly described compensation.


Do not force every opportunity to be paid.



However, compensation must be disclosed honestly.



## 6.2 Project Description



Provide structured fields instead of a single unrestricted description.



The creator must explain:



What needs to be done?
Why is the work required?
What skills are needed?
What must be delivered?
When must it be completed?
What compensation is offered?


## 6.3 Project Status



Possible statuses:



Draft.
Open.
Reviewing Applications.
In Progress.
Completed.
Cancelled.
Closed.


## 6.4 Project Management



The project creator must be able to:



Edit project information.
Close applications.
Review applicants.
Select candidates.
Cancel projects with an appropriate reason.
Mark projects completed.


Do not allow arbitrary status changes that bypass the project workflow.



---



# 7. PROJECT DISCOVERY



Create a separate project discovery page.



Display project cards containing:



Project title.
Creator or organisation.
Required skills.
Budget.
Deadline.
Project type.
Posting date.
Application status.


Provide filters for:



Required skills.
Budget.
Project category.
Deadline.
Project type.
Organisation.


Allow freelancers to save interesting projects.



Prevent students from applying to their own projects.



Prevent duplicate applications to the same project.



---



# 8. APPLICATION SYSTEM



## 8.1 Apply for Project



An application must include:



Short introduction.
Relevant experience.
Relevant portfolio links.
Estimated completion time.
Proposed price, when applicable.
Additional comments.


Allow the freelancer to review the application before submitting.



## 8.2 Application Status



Use the following statuses:



Submitted.
Under Review.
Shortlisted.
Accepted.
Rejected.
Withdrawn.


## 8.3 Project Creator Dashboard



The creator must be able to:



View all applications.
Compare applicant profiles.
Open portfolios.
Review proposed timelines.
Review proposed pricing.
Shortlist candidates.
Accept an application.
Reject an application.


When an application is accepted, the system must prevent another conflicting acceptance if the project only requires one freelancer.



Support multiple selected freelancers when the project specifies multiple positions.



Notify applicants about status changes.



---



# 9. PROJECT AGREEMENT SYSTEM



Before work starts, the selected parties must establish a clear agreement.



The agreement must include:



Project title.
Client.
Freelancer.
Deliverables.
Deadline.
Payment amount or compensation arrangement.
Payment milestones, if applicable.
Revision limit.
Responsibilities.
Additional-work policy.
Agreement confirmation.


Both parties must explicitly accept the agreement.



Store the agreement as an immutable versioned record.



If the agreement changes, create a new version and require both parties to accept the changes.



Do not allow one party to silently modify an accepted agreement.



This feature is important for preventing scope misunderstandings.



---



# 10. PROJECT WORKSPACE



After agreement acceptance, create a project workspace.



## 10.1 Workspace Overview



Display:



Project title.
Project members.
Project description.
Deliverables.
Deadline.
Current status.
Progress.


## 10.2 Milestones



Allow the project creator and freelancer to establish milestones.



Each milestone must contain:



Title.
Description.
Due date.
Status.
Completion notes.


Statuses:



Pending.
In Progress.
Submitted.
Approved.
Needs Revision.


## 10.3 Progress Updates



Freelancers can submit updates.



Examples:



Work started.
Initial design completed.
First draft submitted.
Revisions completed.
Final deliverables submitted.


Project creators can respond with feedback.



## 10.4 Communication



Provide project-related communication.



For the initial MVP, implement structured project comments and updates rather than complex real-time chat.



A future version can introduce direct messaging.



---



# 11. AVAILABILITY SYSTEM



Students must be able to communicate their availability.



Statuses:



Available.
Limited Availability.
Busy.
Unavailable.


Allow optional availability dates and notes.



Examples:



Available for small projects.
Available after examinations.
Available on weekends.


Display the latest availability update.



Do not claim that a student's availability is guaranteed.



Students must control their own availability information.



---



# 12. REVIEW AND REPUTATION SYSTEM



After project completion, both parties can provide feedback.



## 12.1 Review Categories



Allow ratings and written feedback for:



Communication.
Reliability.
Quality of work.
Meeting deadlines.
Overall collaboration.


## 12.2 Review Rules



Only actual project participants can review.
Reviews can only be submitted after project completion.
One review per participant per completed project.
Users cannot review their own profiles.
Provide a report mechanism for abusive or fraudulent reviews.
Do not allow users to edit another person's review.
Allow moderation of reported content.


Display completed projects separately from self-reported portfolio projects.



Never imply that a completed project is independently verified unless the platform has actually verified it.



---



# 13. CLUB AND ORGANISATION MANAGEMENT



This module addresses an important finding from our interviews.



Club committees frequently lose freelancer contacts and previous project information when members graduate.



## 13.1 Organisation Profile



Store:



Organisation name.
Description.
University.
Category.
Logo.
Contact information.
Official status.


## 13.2 Organisation Members



Support roles:



President.
Secretary.
Treasurer.
Event Coordinator.
Media Head.
Member.


Permissions must be configurable.



## 13.3 Freelancer Directory



Organisations can maintain records of freelancers they have worked with.



Store:



Freelancer profile.
Skills provided.
Previous project.
Date of collaboration.
Agreed price.
Payment status.
Deliverables.
Collaboration feedback.
Notes for future committees.


These records must only be visible to authorised organisation members.



## 13.4 Committee Handover



Provide a handover feature.



An outgoing administrator must be able to prepare a handover containing:



Freelancer contacts.
Previous projects.
Project costs.
Outstanding payments.
Collaboration notes.
Active projects.
Important documents.


The incoming administrator must be able to review and accept the handover.



Never expose private information beyond authorised organisation members.



## 13.5 Organisation History



Maintain a permanent organisation-level project history.



Do not delete project history simply because a member leaves.



Transfer administrative ownership safely.



---



# 14. NOTIFICATION SYSTEM



Users must receive notifications for important events.



Examples:



New project application.
Application accepted.
Application rejected.
Project invitation.
Agreement awaiting confirmation.
Agreement accepted.
New project update.
Milestone submitted.
Revision requested.
Project completed.
New review.
Organisation invitation.
Handover request.


Provide:



Notification list.
Read/unread status.
Mark as read.
Mark all as read.
Notification preferences.


For the MVP, implement in-app notifications first.



Email notifications can be introduced as a subsequent improvement.



---



# 15. DASHBOARDS



## 15.1 Student Dashboard



The student dashboard must contain:



Welcome message.
Profile completion indicator.
Availability status.
Recommended projects.
Recently posted projects.
My applications.
Active projects.
Saved projects.
Recent notifications.


Provide shortcuts to:



Edit Profile.
Manage Skills.
Manage Portfolio.
Explore Talent.
Find Projects.
Post Project.


## 15.2 Freelancer Dashboard



Display:



Active applications.
Accepted projects.
Active milestones.
Upcoming deadlines.
Recent project updates.
Profile views, if reliable analytics are implemented.
Availability.


## 15.3 Organisation Dashboard



Display:



Organisation profile.
Active projects.
Open project requirements.
Applications received.
Freelancer records.
Previous projects.
Payment records.
Committee members.
Handover status.


## 15.4 Administrator Dashboard



Display:



Total registered users.
Total organisations.
Active projects.
Completed projects.
Pending reports.
Account moderation tools.


Only display genuine database-derived statistics.



---



# 16. SEARCH AND MATCHING



Implement a basic rule-based discovery system.



For project recommendations, consider:



Skill overlap.
Department, where relevant.
Availability.
Project category.
Project requirements.


For freelancer recommendations, consider:



Relevant skills.
Portfolio relevance.
Availability.
Previous collaboration history.


Do not introduce an AI recommendation engine in the initial MVP.



Search results must be explainable and based on actual stored information.



---



# 17. DATABASE ARCHITECTURE



Use Supabase PostgreSQL.



The initial database should contain the following entities.



## Authentication and Users



profiles
universities
departments


## Skills and Portfolios



4. skills

5. user_skills

6. portfolio_items



## Projects



7. projects

8. project_skills

9. applications

10. project_members

11. agreements

12. agreement_versions

13. milestones

14. project_updates



## Collaboration



15. reviews

16. saved_projects

17. saved_freelancers

18. notifications



## Organisations



19. organisations

20. organisation_members

21. organisation_freelancers

22. organisation_handover_records



## Administration



23. reports

24. moderation_actions



Define proper primary keys, foreign keys, unique constraints, indexes and timestamps.



Use UUID identifiers.



Use database migrations for all schema changes.



Do not store multiple unrelated values in one text field when a relational structure is appropriate.



---



# 18. SECURITY REQUIREMENTS



Security is mandatory.



Use Supabase Authentication.



Enable Row Level Security on all exposed tables.



Implement policies ensuring:



Users can edit only their own profiles.
Users can edit only their own portfolio entries.
Project creators can manage their own projects.
Freelancers can manage only their own applications.
Only authorised parties can view private project information.
Only project participants can access project workspaces.
Only organisation members with appropriate permissions can access organisation records.
Organisation administrators can manage membership according to their role.
Only platform administrators can perform platform moderation.


Additional requirements:



Validate all inputs.
Restrict file types and file sizes.
Protect against malicious uploads.
Never expose Supabase service-role credentials in frontend code.
Keep environment variables out of GitHub.
Use secure session handling.
Apply appropriate rate limits.
Avoid exposing private student contact information publicly.
Maintain audit records for important administrative actions.


Security must be tested, not merely assumed.



---



# 19. TECHNOLOGY STACK



Use the following architecture for the initial implementation.



## Frontend



React.
Vite.
JavaScript initially.
Tailwind CSS.
React Router.
Lucide React icons.
A reusable component architecture.


## Backend Services



Supabase Authentication.
Supabase PostgreSQL.
Supabase Storage.
Supabase database functions where necessary.


## Development



Google Antigravity.
Git.
GitHub.
Postman or equivalent API testing tools.


## Deployment



Vercel for the frontend.
Supabase for backend services and database.


Avoid adding Express.js or another backend framework unless a concrete requirement justifies it.



Keep the application modular so a custom backend can be introduced later.



---



# 20. USER INTERFACE AND DESIGN SYSTEM



The application must look like a professional modern software product.



Do not make it look like a generic college assignment or an outdated admin template.



## 20.1 Design Direction



Use:



Clean modern layout.
Professional typography.
Spacious sections.
Consistent spacing.
Rounded but restrained cards.
Clear visual hierarchy.
Subtle shadows.
Smooth transitions.
Accessible contrast.
Responsive layouts.


Suggested visual direction:



Primary colour: Deep indigo.
Secondary colour: Blue.
Accent colour: Teal.
Background: Soft neutral.
Cards: White or subtle neutral.
Text: Dark slate.


These colours are starting suggestions. Create a consistent design system rather than choosing colours independently for every screen.



## 20.2 Typography



Use a modern readable font such as Inter.



Establish consistent sizes for:



Main headings.
Section headings.
Card headings.
Body text.
Supporting text.
Buttons.
Labels.


## 20.3 Components



Create reusable components:



Navbar.
Sidebar.
Footer.
Buttons.
Input fields.
Dropdowns.
Search bars.
Filter panels.
Profile cards.
Project cards.
Skill badges.
Status badges.
Modal dialogs.
Confirmation dialogs.
Toast notifications.
Pagination.
Loading indicators.
Empty states.
Error states.


## 20.4 Responsive Design



Support:



Desktop.
Laptop.
Tablet.
Mobile.


Navigation must adapt to screen size.



Do not allow horizontal overflow.



Forms and cards must remain usable on small screens.



## 20.5 Interaction Quality



Every interactive control must work.



Examples:



Buttons must perform their intended action.
Forms must validate input.
Dropdowns must open and function.
Filters must actually filter results.
Search must return relevant records.
Modals must close correctly.
Loading states must be visible.
Errors must be understandable.


Do not create decorative controls that do nothing.



---



# 21. ACCESSIBILITY



Follow practical accessibility standards.



Use semantic HTML.
Provide labels for form fields.
Support keyboard navigation.
Provide visible focus states.
Use appropriate contrast.
Add alternative text for meaningful images.
Do not communicate status using colour alone.
Make error messages understandable.


---



# 22. MVP DEVELOPMENT PRIORITIES



Do not build everything simultaneously.



## Phase 1: Foundation



Project setup.
Design system.
Landing page.
Navigation.
Responsive layout.
Authentication.
Database connection.


## Phase 2: Student Profiles



Profile creation.
Profile editing.
Skills.
Portfolio management.
Availability.


## Phase 3: Marketplace



Talent discovery.
Search.
Filters.
Project creation.
Project discovery.


## Phase 4: Applications



Apply for projects.
View applications.
Shortlist applicants.
Accept and reject applications.
Application notifications.


## Phase 5: Collaboration



Project agreements.
Milestones.
Project updates.
Completion.
Reviews.


## Phase 6: Organisations



Organisation profiles.
Organisation membership.
Freelancer directory.
Project history.
Handover records.


## Phase 7: Quality and Deployment



Security testing.
Responsive testing.
Functional testing.
Error handling.
Performance optimisation.
Deployment.


Do not begin a new phase until the previous phase has been tested.



---



# 23. NON-FUNCTIONAL REQUIREMENTS



The application must be:



### Reliable

Core functions should work consistently.



### Maintainable

Use reusable components and organised modules.



### Secure

Enforce database permissions and authentication.



### Scalable

Use a relational database and modular architecture.



### Responsive

Work across desktop, tablet and mobile.



### Accessible

Follow accessibility best practices.



### Performant

Optimise images, database queries and frontend rendering.



### Usable

Provide clear navigation, understandable feedback and simple workflows.



---



# 24. IMPORTANT DEVELOPMENT RULES FOR THE AI DEVELOPER



Follow these rules throughout the project.



Do not generate the entire application in one attempt.
Follow the phased development roadmap.
Analyse requirements before implementation.
Maintain a clear folder structure.
Use reusable React components.
Keep frontend and database responsibilities separate.
Use proper database relationships.
Implement Row Level Security before exposing database functionality.
Never hardcode credentials.
Never fabricate user information or application statistics.
Do not use mock data as though it were real production data.
Clearly identify temporary mock data.
Validate forms on both client and server/database boundaries.
Test each feature before declaring it complete.
Fix existing errors before adding unrelated features.
Do not overwrite working functionality without reason.
Use Git commits at meaningful milestones.
Document important architectural decisions.
Keep a development log.
Ask for clarification when requirements are ambiguous.
Do not introduce unnecessary technologies.
Do not install packages without explaining why they are required.
Do not execute destructive commands without explicit approval.
Do not expose secrets in source code.
Never claim that a feature works without testing it.


---



# 25. PROJECT DOCUMENTATION



Maintain these files in the project repository:



README.md — Project overview and setup.
PRODUCT_SPEC.md — Product requirements.
ARCHITECTURE.md — System architecture.
DATABASE.md — Database schema and relationships.
SECURITY.md — Authentication and security policies.
API_DOCUMENTATION.md — API and database operations.
DESIGN_SYSTEM.md — UI/UX standards.
DEVELOPMENT_PLAN.md — Development milestones.
TESTING.md — Test cases and results.
CHANGELOG.md — Important project changes.


Update documentation whenever the architecture or requirements change.



---



# 26. DEFINITION OF DONE



A feature is not complete simply because the AI has generated code.



A feature is complete only when:



Its requirements are implemented.
Its interface works.
Its data is saved correctly.
Permissions are enforced.
Invalid inputs are handled.
Loading and error states work.
It has been tested.
It does not break existing features.
Documentation is updated.
The changes are committed to version control.


---



# 27. FIRST TASK FOR THE AI DEVELOPER



You are now acting as the Senior Software Architect and Technical Lead for SkillBridge.



Read this complete specification.



Do not start writing application code immediately.



Your first assignment is:



Analyse every module.
Identify dependencies between modules.
Identify missing or ambiguous requirements.
Propose the final database schema.
Design the application architecture.
Define the frontend folder structure.
Define the database security model.
Create a milestone-based implementation plan.
Identify technical risks.
Identify features that should be postponed beyond the MVP.


Create an implementation proposal and wait for human approval.



The project owner is a beginner in programming and will supervise development through AI-assisted workflows.



Explain technical decisions in understandable language.



Do not sacrifice security or maintainability for development speed.



**The objective is to build a functional, secure, maintainable SkillBridge application—not merely a visually attractive prototype.**