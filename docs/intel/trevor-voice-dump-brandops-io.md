# Overview & Intro

# **BrandOps / 85 Supply Merch Platform**

## **Master System Overview for AI Agents**

### **Purpose of This Document**

This document is intended to guide AI agents through improving and refining the **BrandOps merch operations platform**.

The platform already contains strong foundational architecture and UI structure. However, the goal of this process is **not simply to tweak UI components**, but to transform the system into the **most powerful merchandise operations platform in the industry**.

AI agents reviewing this document should focus on:

• improving workflow efficiency  
 • reducing operational friction  
 • improving information clarity  
 • strengthening system logic  
 • improving data architecture  
 • improving user experience for both admins and clients  
 • increasing scalability for large-volume merchandise businesses

The goal is to support a system capable of **processing millions of dollars in merchandise orders annually while keeping operational overhead extremely low**.

---

# **Platform Mission**

BrandOps is designed to be a **complete operating system for modern merchandise businesses**.

It replaces fragmented workflows currently handled across:

• spreadsheets  
 • email  
 • Slack  
 • Dropbox  
 • QuickBooks  
 • Shopify  
 • CRM systems  
 • project management tools

Instead, BrandOps centralizes everything into **one system designed specifically for merch operations**.

The system must enable teams to:

• manage clients  
 • create merch programs  
 • quote products quickly  
 • manage artwork  
 • coordinate vendors  
 • track production  
 • manage orders  
 • manage logistics  
 • invoice clients  
 • track profitability

All within a **single unified workflow.**

---

# **Core Philosophy of the Platform**

The system is built around **three operational principles**:

### **1\. Speed**

Merch businesses lose deals because quoting and project turnaround is slow.

BrandOps must allow teams to:

• build quotes in seconds  
 • build merch proposals rapidly  
 • generate client approvals quickly  
 • convert projects into production immediately

Every feature should optimize **time-to-quote** and **time-to-production**.

---

### **2\. Clarity**

Merch projects involve many moving parts:

• products  
 • artwork  
 • colors  
 • sizes  
 • vendors  
 • decorators  
 • shipping  
 • payments

BrandOps must eliminate confusion by ensuring that:

• every item has clear status  
 • every file is organized  
 • every step is visible  
 • every stakeholder knows what is required

The system must **prevent mistakes before they happen.**

---

### **3\. Scalability**

The platform must scale from:

**small agencies → large merch operators → enterprise merchandise programs**

Meaning the system must support:

• hundreds of clients  
 • thousands of projects  
 • tens of thousands of orders  
 • multiple vendors  
 • multiple decorators  
 • distributed teams

Architecture must support **high volume operations without increasing complexity.**

---

# **System Structure Overview**

The entire platform revolves around a **core workflow pipeline**.

Everything in the system flows through the following hierarchy:

Client  
  ↓  
Project  
  ↓  
Products  
  ↓  
Orders  
  ↓  
Production  
  ↓  
Shipment  
  ↓  
Payment

Each section of the platform supports one part of this lifecycle.

---

# **The Left Navigation Architecture**

The navigation structure represents the **core operational modules** of the system:

Dashboard  
 Clients  
 Projects  
 Orders  
 Products  
 Creative  
 Decorations  
 Vendors  
 Programs  
 Tickets  
 Commissions  
 Analytics  
 Settings

Each section has a specific role in the system.

---

# **Dashboard**

The dashboard serves as the **operational command center**.

It provides a quick snapshot of:

• pipeline value  
 • active projects  
 • production workload  
 • revenue metrics  
 • system activity

It should answer the following questions immediately:

• What projects need attention today?  
 • What orders are in production?  
 • What clients are waiting on responses?  
 • What revenue is currently in pipeline?

The dashboard must prioritize **actionable insight rather than vanity metrics**.

---

# **Clients**

Clients represent **companies or organizations purchasing merchandise**.

Each client acts as a **container for business relationships**.

A client includes:

• contacts  
 • billing addresses  
 • shipping addresses  
 • address groups  
 • tax documents  
 • file libraries  
 • historical orders  
 • project history  
 • activity logs

Clients must function as both:

• **CRM record**  
 • **operational data source**

Client pages must make it easy to understand:

• who the client is  
 • who the contacts are  
 • where products ship  
 • what the client has ordered before  
 • what projects are active

Client management must remain **extremely simple while remaining powerful.**

---

# **Projects**

Projects represent **merch initiatives or campaigns**.

Examples:

• Event merchandise  
 • Corporate swag programs  
 • Uniform rollouts  
 • Artist merch drops  
 • Conference giveaways

Projects function as the **core working environment** where teams build merchandise proposals.

A project includes:

• client information  
 • contacts  
 • timeline  
 • products  
 • artwork  
 • files  
 • comments  
 • approvals  
 • pricing  
 • shipping information  
 • payment terms

Projects move through a **pipeline lifecycle**:

Opportunity  
 Qualifying  
 Curating  
 In Design  
 Presenting  
 Client Review  
 Ordered

Each stage reflects progress toward production.

---

# **Products**

Products represent **physical merchandise items**.

Examples:

• T-shirts  
 • Hoodies  
 • Hats  
 • Jackets  
 • Drinkware  
 • Notebooks

Products in the catalog act as **reusable templates**.

Each product contains:

• brand  
 • style  
 • blank cost  
 • supplier  
 • decoration compatibility  
 • size options  
 • color options  
 • images

Products exist in two pricing models:

### **Contract Products**

These separate:

blank cost

* decoration cost

Used for apparel and decorated goods.

---

### **All-In Products**

These combine everything into one price.

Used for:

• drinkware  
 • promotional items  
 • pre-decorated goods

---

# **Decorations**

Decorations represent **production methods applied to products**.

Examples:

• Screen print  
 • Embroidery  
 • DTG  
 • Heat transfer

Each decoration includes pricing matrices such as:

• quantity price breaks  
 • setup charges  
 • run charges  
 • color counts

These matrices allow the system to **automatically calculate production costs**.

---

# **Vendors**

Vendors represent **production partners**.

Two main types:

### **Suppliers**

Provide blank products.

Examples:

• S\&S Activewear  
 • alphabroder

### **Decorators**

Apply decoration to products.

Examples:

• screen printers  
 • embroidery shops

Vendor management includes:

• contacts  
 • pricing matrices  
 • production capabilities

---

# **Creative**

Creative manages **artwork and design tasks**.

This includes:

• logo vectorization  
 • mockups  
 • color separations  
 • design revisions

Creative requests are tied to **projects** so artwork stays connected to the correct merchandise.

---

# **Orders**

Orders represent **confirmed production jobs**.

Once a project is approved by the client, it generates orders.

Orders contain:

• product details  
 • quantities  
 • vendor assignment  
 • tracking numbers  
 • shipment status  
 • Salesforce sync  
 • invoice generation

Orders are managed through stages:

Order Entry Needed  
 Entered (Salesforce)  
 In Production  
 Shipped  
 Ready for Invoicing

---

# **Files**

File organization is critical in merch workflows.

Files exist at multiple levels:

Client Files  
 Project Files  
 Product Files  
 Client Submitted Files  
 Production Files

The system must clearly connect files to:

• projects  
 • products  
 • decoration locations

Poor file management is one of the biggest operational problems in merch businesses.

BrandOps must solve this.

---

# **Client Portal**

Clients interact with the system through a **public-facing project portal**.

Clients can:

• review product proposals  
 • approve projects  
 • upload artwork  
 • enter shipping addresses  
 • submit size breakdowns  
 • pay invoices (if prepaid)

This portal replaces long email threads and messy approval workflows.

---

# **Payment Logic**

Two payment models exist:

### **Net Terms**

Client approves project → invoice generated → payment due later.

### **Prepay**

Client approves project → immediate payment required → Stripe checkout.

The system must track:

• payment status  
 • transaction details  
 • payment confirmations

---

# **AI Improvement Objectives**

The AI agents reviewing this document must focus on improving:

### **Workflow Efficiency**

Reduce the number of steps required to:

• create projects  
 • quote products  
 • generate orders

---

### **Data Architecture**

Ensure data relationships are logical between:

Clients  
 Projects  
 Products  
 Orders  
 Vendors  
 Decorations

---

### **UI/UX Clarity**

Interfaces should be intuitive enough that:

• new employees learn the system quickly  
 • information is never hidden  
 • statuses are always visible

---

### **Automation Opportunities**

AI agents should identify opportunities to automate:

• pricing calculations  
 • project creation  
 • artwork validation  
 • vendor selection  
 • order generation

---

### **Error Prevention**

The system should prevent mistakes such as:

• missing artwork  
 • missing sizes  
 • missing addresses  
 • incorrect decoration settings

---

# **Ultimate Goal**

The long-term vision for BrandOps is to become:

**the industry standard operating system for merchandise businesses.**

The system should eventually power:

• agencies  
 • merchandise distributors  
 • promotional product companies  
 • large brands with internal merch programs  
 • artist merch companies  
 • corporate swag programs

The platform should allow teams to:

**quote faster than competitors**  
 **produce faster than competitors**  
 **deliver a better client experience than competitors**

---

# **Final Instruction to AI Agents**

As you analyze each section of this document:

Do not only evaluate **UI improvements**.

You should also analyze:

• system logic  
 • operational workflows  
 • data structure  
 • automation opportunities  
 • scalability risks

The next tabs in this google docs are Trevor the founder reviewing the current app in real time using voice to text giving his professional feedback.

Every improvement should move the platform closer to becoming the **most efficient merchandise operations platform ever built.**

# Clients

I'm going to speak in regards to the clients section.

Basically, when a user is in the client section and they select a client, that should open as a full page. We want to see that each client will have contacts associated. There will also be contact types, so there are multiple contacts on a client, which are individuals that have the name, email, and phone number, and they have a contact type. For example, you might have an order contact, or you might have a finance contact.

Also, in regards to the addresses on a client, I want to restructure this so that when you select a client and you see all of their details, there is an address book related to a client. On the actual client itself, there is a primary shipping address, a primary billing address, and then an address book. Within that address book, there should be groups. Think of it like folders of addresses. For example, if a band has an upcoming tour and I need to create a group of addresses, I can do that. It should be your standard address fields for easy importing, meaning:

* Address field one  
* Address field two  
* Address field three  
* City  
* State (picker of lower 48 US states)  
* Zip  
* But also be able to ship internationally and show an international experience for creating an international shipment

There should also be easy CSV importing for these address groups. Also, for all of the addresses in this application, the state should be a picker of all the lower 48 states. If tax exempt is checked on a client, then it should show an upload field where we can upload the tax-exempt documentation for that client.

Now, as far as a client, I should be able to click a client and also see all of the projects and orders related to that client. That will navigate me to that project or to those individual orders related to that project.There should also be a simple CRM portion to add notes, attachments, etc for a client. You should also be able to see a clients file library in this section, which is the “client art” section on a project also so that a user can see the client art and folders within a client’s artwork directly on a project.

The experience of being in clients, the main tab, and then selecting a client currently right now has a small quarter pop-up. That should be changed to a full experience for full client management. These fields in a client are directly going to display on a project, which I'll cover next.

Also, whenever the user is on the overall client tab, I want it to be an experience where the user can see the last activity. It's sorted by:

* annual sales to date  
* total spend  
* total spend directly related to confirmed projects or confirmed orders

When the user clicks Clients, I just want to make sure that the user is seeing clients by priority and their spend with us, as well as being able to sort by last activity date. That way, we can see that we see clients that are aging that we haven't contacted in a while.

I see currently that we have a last updated field. It sounds like that field might want to be updated. When you click Clients, it should be able to see by priority, spend, or whatever. I'm going to leave that up to the AI agent to really make sure that, when my user goes to the client section, they are seeing clients by how important that client is and their last activity. They can easily see clients we have not spoken with in a while and follow up with them.

I want you to review all of the instructions here. For the client section, I want it to be extremely intuitive for the user for simple client management, as well as follow all my instructions here in regards to the client structure of:

* contacts  
* primary address  
* billing  
* primary billing  
* primary shipping  
* address groups  
* an address book

All of the tax information, everything that I've mentioned above, I want you to adhere perfectly to all this and make the best possible experience.

# Projects

Now moving on to projects. When I select projects on the left navigation bar, some things that I am seeing that need to be improved:

* The client clicks New Project, names their project, and selects a client.  
* The user needs the ability to also create a client from this experience in the event that the client is not shown here. They need to be able to create the client, which they will be prompted to enter the client name and a main contact for that client, essentially a sub experience of creating a client in the Clients tab just here.

The only thing is that the user may not know the shipping or the billing address, but we will cover this later, because a project cannot be converted or approved without billing and shipping address. My thought is that the user can quickly create a client, enter in some critical information that we're going to need, and if they are missing their billing or shipping information, once we share the project with the client for the client-facing view, the client sees that they can't approve their project or products on their project because we don't have their billing and shipping information. If they enter that information, it's logged; the project is updated as well as the client address book or whatever. Just the information across the board is all updated in regards to the enhanced date.

I do not like that terminology. The enhanced date terminology is not correct. The enhanced date is actually supposed to be a project deadline. This is when the overall project is supposed to be completed in order to meet the enhanced date. Also, when you're creating a new project, you should see the enhanced date picker. This is an enhanced date. This is the date that all of the product needs to be in the client's hands. It is not the ship date; it is nothing. There is a deadline for the project, and that date is currently called enhanced date. That should be replaced with project deadline. That is the date that the project needs to be completed by us in order to meet the client-in-hands date. The terminology “enhanced date” is null and should be replaced with “Project Deadline.”

Now I am going to talk directly related to when a user has selected a project. Currently, when a user selects a project, they see the client, and if they click when they are adding a contact to a project, one field that is missing that I spoke about earlier in the clients section is the contact type. This is essentially a sub-experience of adding a contact to a client. It would be the name, email, phone number, as well as the contact type.

In terms of timeline and production, the enhanced date is the enhanced date for the project, and then the project deadline is correct. That is the project deadline that I was referring to above; that is currently called an enhanced date. This is the same field basically.

* Production time standard or rush is fine.  
* Split shipment yes or no is okay.

Now I will talk about split shipments later.

Currently, on a project, there is a voice note and there is a notes field. This is extremely confusing because below there's also internal notes where a user can make internal notes about this project. The current notes field above, next to the voice note, should be a comment section where you can comment and mention a user. This is a comment section, not a note section, so re-label that from notes to comments and then internal notes. That section should be just called notes, and when you drop it down, you should see a section for client-facing notes and internal notes.

Also, I want to move this section above the client details and below the comment section.

Now I'm currently reviewing a product on a project, and I'm realizing that once a project is shared with a client and maybe we have all of the information and it's ready to be sent to the client (for example, the artwork per product or whatever it may be), there needs to be. I need to see the user. The admin user needs to see. Maybe I'm a bit confused.

Maybe we add a tab in the files called Product Files, and those files are for every product that is added to a project. Those files relate to a product or a product on a project, or the file is directly on the project itself, related with the decoration location. I'm going to leave that complexity up to you. Your job is to create an incredible experience for simple and clean file organization for the admin as well as for the client. To make sure that the files are clearly linked to products or decoration locations, and make it extremely easy and understood for both the admin user as well as the client.

The Clients Submitted tab in the files section on a project is essentially the files that a client on the public-facing URL has uploaded and submitted. Those files are either linked to or related to a product or a decoration location or both, but that is the client-submitted. The admin user should be able to mark that file as okay or problem, and that way, if there is an issue, they can keep track of files that need replaced. Remember, a project cannot move forward with any issues.

Also, one thing very, very important to note is that if a client is on prepay terms, then when we share the final project for their approval, we will need to capture their credit card information. 

So on the public facing side, when the client is reviewing a project and there are still things needed, like sizes and art files and things of that nature, they can either enter all of those details and then click to submit one. A project must always be reviewed by an internal team member, so the user is going to curate their project and submit their details. They'll see a success message: "Thank you, we've got everything. We're reviewing it. If we need anything else, we'll let you know."

Internally, we review that, and if they are on net 30 terms, then we will send it back: "Your project is ready for your final approval." They will see it. The client will review everything, see the estimated total, and approve it. If they are on net 30 terms, I want them to approve the order and be prompted: "Are you sure? Your project will be moved to production, and you will receive an invoice due within 30 days after it is shipped." They say yes and approve.

If the payment terms on the project are prepaid, then they approve the project and are prompted: "Are you sure?" It says "Approve" instead of the button saying "Approve"; it should say "Approve and Pay", and they say "Yes". It opens up a browser where they have to pay, and that's the Stripe integration.

On the back side, we need a marker on that project that says "This has been paid", and the payment details need to go in a payments section on the project.

# Product on Project

Now I'm going to speak in regards to a product on a project. Currently, the user clicks Add Product, and it has a product name and a quantity. That is not the proper user experience.

When you click New Product, it should open up the three-quarter sidebar, and it should be kind of an empty experience where a user is selecting from the catalog, which is looking up the product section, or a quick entry, which should be the same layout but just where they can:

* click available sizes  
* click the brand  
* type the brand or style  
* type the blank costs  
* type the size is available  
* type the color is available  
* quickly type the color available and hit Enter, and it's a color available

From there, there should be a toggle of from catalog or quick entry. 

I'm going to talk now in relation to a product on a project. When a user adds a product to a project, the experience should be that they are going to look it up from the catalog or they're going to make a manual entry. If they look it up from the catalog, it's going to be an experience of looking it up in the catalog between contract products and all-in products, and we're going to talk about that later on in the products tab in regards to what is a contract product and an all-in product currently. The logic is there; it just needs to be refined.

Now, the primary image of a product should be the main image. It should be a very big deal, and the user should be able to drag and drop the primary image as well as multiple sub images related to that product. The display name should be the product that is selected from the catalog, or the user can override that. For example, if they add a Gildan 5000 from the catalog, the display name populates as Gildan 5000, but they can override that and call it, for example, skull t-shirts or whatever, just an identifier name.

Now, the pricing mode is all-in or contract. In regards to this field, it should populate in accordance with the product that was selected. The user should be able to remove or delete a product from a project, whether they have the product selected or from the project view. Now, for example, let's talk about if a user selects a contract product and adds it to the project, then the sizes available or whatever, but the details, the sizes, should populate. The blank unit cost essentially is looking up the product catalog and displaying that information here, and they should see the blank unit cost when they select that as a contract product currently. Small through XL, 2X, 3X, 4X, for example, those are not populating, so we need a remedy. The notes field, client facing, internal, that is totally okay.

Now, talking in regards to the decoration locations, the user will add a location, and currently it's just a small icon, but the user needs the ability to drag and drop an image that is related to that location and simply drag and drop it right there. 

I'm going to speak into regards to some complexity here. If the user adds, for example, we will take. I'm going to use an example as a t-shirt that has a one-color print on the left chest and an embroidered logo on the sleeve. This is just for an example. Those two decoration matrices may have different price breaks or quantity breaks.

The idea is for the user to select the front. For example, they select one color and then they add another location and they select sleeve and they select embroidery. Screen printing price breaks might be the primary price breaks, and then embroidery might have different price breaks. You need to give the user a very simple and intuitive experience to where, for example, the embroidery price break might have the mathematics distributed in accordance with the primary price breaks. That way, our end user still sees the price breaks, for example, 24, 36, 50, and 100, but behind the scenes, if embroidery is selected, the price breaks are 12, 24, 48, 72, and 144\. You will distribute those price breaks accordingly so that the end user still sees incremental price breaks as the primary quantity breaks increase. The admin user of this application can see that it's been distributed across the board for the primary price grid.

The first print location selected on a product is always going to be the primary price breaks. For example, in this example, if the first print location is a printed left chest and then they add a second location that is an embroidered sleeve, the primary price grid breaks are going to be in accordance with the screen printing decoration matrix price breaks. You will build mathematical logic behind the scenes that will take the embroidered sleeve price breaks and distribute them correctly across the primary price breaks. Maybe add a small little note or a helper tooltip that helps the user understand that that has been done.

Now I want to talk about product add-ons and location add-ons. This is, according to the industry, incorrect. This should be run charges and fixed charges.

* Run charges is a single charge that can be related on the product level or the decoration level, or the overall level, or related to a location.  
* Product add-ons and location add-ons should be run charges and fixed charges. That's the industry terminology.

If the user wants to add a run charge, they're going to add a run charge here. It's going to know, because this run charge is in the decorator, it's in our decorations database, that they're going to add a run charge or a fixed charge here. A run charge, for example, might be discharge inks. It might be, and that might be related to a specific location. It's important that, when the user adds a run charge, they need to relate it to a location. That run charge cost is going to populate, and then, according to the margin selected, it'll show the sale unit price, etc. That's a run charge.

A fixed charge can also be related to a location. I'm going to let you be the determining factor as to if you want the user to be able to add a run charge and a fixed charge to each location when they're entering the locations. That might be the best course of action here instead of separating them below the pricing grid.

When a user adds a location, they select that location. For example, I'm going to give you an example. They might add the front screen printing three colors and then add a fixed charge to this location. That might be a setup, and that fixed charge is looking up our decoration fixed charges. They might add a run charge of maybe discharge inks, and that is related to that location.

Fixed charge and run charge need to be on the location level. As far as below the price grid, the user should be able to add any fixed charges on the product level, for example a rush fee or something like that.

Now, in regards to the quantities received toggle and display here, this should show the colors that are available.

Now, going back to earlier, when a user selects a product from the catalog, it's going to know the products available, so the user should be able to select from the. It's going to know the colors available, and when they add a product to a project, they can select the colors available that they want to display to the client. Those are the colors that would be associated with the final sizes currently. Right now, the colors are in a text field, and that is incorrect.

Now, if a product was added manually as a quick entry, as I mentioned earlier, then the user can type the color in a text field, hit enter, and it becomes a selectable color available or size. It's an option to choose from. Now, at this point, the user can enter the quantities for this, and that would complete creating a product on a project experience for the admin user.

Please note that no financial data is able to be calculated unless quantities are received on a product.

Art received and quantities received checkboxes are very important things. I want them relocated to where my user understands that they have added a product to this record, but these are two very important things that we need in order to process this product on this project.

I also want to talk about enhanced dates related to individual products. When a product is selected, the project enhanced date should apply to all products. Now, however, the admin should be able to control the enhanced date and adjust it per product, because, for example, a client might order 100 t-shirts, 100 hats, and 100 coffee mugs. The enhanced date for the t-shirts is the first, the enhanced date for the coffee mugs is the third, etc., so on and so forth.

In most cases, the enhanced date on a project is going to be related to all products on a project, but there is a bit of complexity when you have an enhanced date that is specifically dedicated to a specific product on a project.

# Client Facing Project View

Now I'm going to talk about the client-facing experience of viewing a project. When viewing a project, it should be a beautiful experience. I will start there.

Currently, it has the ability to download a PDF, and it says "Track Orders". If there are no orders related to a project, that "Track Orders" button should not be available.

In the header, it should have:

* the project name  
* the project number  
* who the client is  
* who the main contact related to is  
* the project deadline  
* the enhance date  
* the primary billing  
* the primary shipping  
* things of that nature in a group up top

Currently, it says "Quote Details". That should say "Product" (just "Products"), and then this should be an experience for the user to see the product, the color, the decoration details, any fixed charges and run charges, and whether the sizes have been received. If the quantities are not available, the user should be able to enter their quantities and save their quantities. They should be able to save any note to a product and save it. They should be able to upload a piece of artwork to that product and save it and be prompted: "Does this artwork relate to any of the other products on this project?" If yes, then it relates the art files to the other product. For example, a logo might be related to a t-shirt and a hat. When they upload that file, that file needs to be duplicated on that hat, or at least shown to the user that it's related to both products. 

I want to speak directly to the way a public-facing project should look, starting with if the client is simply just wanting to see some product. We don't know sizes; we don't have artwork or anything like that. The user on the backend should be able to quickly add product from the catalog, select from some colors available which have related images, and essentially create a nice presentation and share it. That should be kind of a feature or version one, whatever you want to call it.

When the admin user shares this with a client, a client should be able to see that there's no art received, there's no quantity received, and there's no decoration locations available. I want to give my client a really beautiful experience and be able to give them a very, very... Maybe we don't have a lot of information, but we're sharing a project with them, and they can build their own quote. In a way, they could maybe select and add a decoration location, and then they can drag and drop their artwork and build that product for them into their sizes. See everything calculated for sale price. Remember this is for our clients. We never want to disclose our raw cost. It would just be an interactive experience for them to build, for them to associate assets and information for every product that is here. It's essentially either an admin is going to do these tasks on the backend, walking, communicating with the client via email, or the client can do it while viewing the shared project link.

Currently, right now, the user or the client, when they are viewing their project, there is a files upload your artwork section. I like that. Earlier, I mentioned uploading artwork per product. Maybe that's not the best experience. I'm gonna leave it up to you as the professional to create a beautiful experience where a user can possibly even drag and drop all of their artwork. They are prompted to relate that artwork with a decoration location on a product. That way, they can essentially build their own project here in this experience.

Also, in the public-facing experience for a client looking at a project, I want them to be able to either approve or decline a product related to a project and remove it. Then it asks, "Are you sure you want to remove this from the project?" It will remove it completely, and your sales rep will have to add it again.

Basically, an experience where they can curate their products and say, "Maybe the admin user is suggesting multiple products to a client, and they want to remove that product from their project because they're not interested." That's totally fine. Maybe it becomes an experience where the product is removed, but they can re-add it if they want from this. That's probably a better experience. I'll leave that up to you as the professional. Your entire job is to make this experience work both ways, to where we cannot have fields or rules or things that do not work cohesively between the front end and the back end. Everything needs to be cohesive.

Currently, right now, you have for the public-facing client experience: the person can request changes on the public-facing URL; however, right now, on the backend experience, the pipeline does not have a status. It's just client review.

I think we should add a tag on the front of the record under client review, as well as a tag when the project is selected from an admin, showing that client changes have been requested or something like that. I need you to build out that user experience completely and perfectly, to where the logic makes total sense for both users of changes that have been requested, etc…

There are certain fields that don't make sense right now. For example, in the upload artwork section of the client-facing project view, these files show approved, pending review, pending review. That doesn't make logical sense. These files are related to the product or the decoration location on a product.

If there are no quantities entered in the size breakdown or quantities field, then we don't need to show the graph. The client needs the ability to enter the quantities if none are entered.

If no quantities are shown, then the line total should be zero. I want you to be an expert when it comes to the mathematical logic on this.

As I mentioned earlier, about the currently where it says "Internal Notes", this should be a section of "Internal Notes" and "Public-Facing Notes". The "Public-Facing Notes" should be within the project details on the public-facing URL as an introduction for the client to read. We may use this to say, "Hi, I've curated this project for you to review. I hope you enjoy it, et cetera, et cetera."

Currently, on the public-facing view, it says "Quick Reorder", and there are things and objects down there. We need to remove all of this; it makes no logical sense currently. However, I want to speak to the approval flow.

The client must have their quantities and artwork uploaded and artwork associated with it, the product or the decoration location on a product. They should have the ability to remove products so that they can curate their final project with all of their sizes and order details and see an estimated cost. 

In regards to shipping costs on a project, we may display shipping costs as an estimated total on the project level, so we need that ability. Currently, we do not have that ability, and we need that ability to enter an estimated shipping cost for the entire project.

The user needs the ability to click a product and, in the shipping and setup notes, enter estimated shipping costs on that product. If quantities are received, then the estimated shipping cost needs to populate. The estimated shipping cost is only known by the admin at this stage, so I'm trying to figure out the logic of that. Once the quantities are received, the admin needs to enter the final shipping information.

Essentially, there has to be two public-facing experiences. There's a public-facing experience. Right now, the public-facing says "Approve and Confirm Order". If that's not correct, it would be experience one, as if there is missing remaining information in here. The client is essentially not approving anything. They are saying, "Yes, all of this looks accurate and true." That experience wouldn't be "Approve and Confirm Order", because there are no shipping charges on here, etc. It would be "Approve and Request Final". It would just be:

* Submit Project Detail  
* Submit Final Details  
* Show a success message that says, "Thank you. We have all of your final order details. Please be on the lookout for your final quote for your approval."

Essentially, I need you to be an expert and build out this logic.

# Split Shipments

Now I'm going to talk about the concept of split shipments. A project is a parent record with associated products that a client might order. Now there's a primary shipping address on the project; however, in many cases we will split ship a product. This is a very complex thing, and the experience of building split shipments should probably be its own section under files or creative requests or products, just in its own section.

If split shipment is yes, then a user needs to be able to create split shipments that clearly show quantities of products on a project related to a destination. The user should be able to create a new destination from scratch or look up the client address book or create a new address and be prompted: do you want to save that to the client's address book or any of the folders within their address book, etc. Split shipments is a very, very important deal. If you are creating split shipments, then an admin user needs the ability to create a split shipment and type quantities and create their locations and associate quantities of product to a location and have a clear split shipment breakdown of the overall split shipments on a project.

There should also be a way to visually download a PNG file that puts this in a visual format. That way the admin user can create the split shipments and download a visual and provide it via email or on the public facing side for a client. If split shipment is yes and no and nothing is filled out, I want my client to be able to build their own split shipment in a step-by-step process in a very, very simple, powerful user experience where they can build their own split shipments and signify what addresses and quantities are going to be with all of the products related on a project. They should be able to build their own split shipments and look up in their address book as well, or create new addresses and be prompted: do you want to save this to your address book? If they do, then that would be created as a new folder within their address book. You're going to have to really figure this out; this is high-level complexity.

For split shipments, it is just a very important thing. The admin needs a very intuitive way to build split shipments and also be warned that maybe, if they have total quantities received and they're building a split shipment, if the quantities don't match and there is remaining, they need to see that. This is extremely high-level, complex logistics mapping, and you are going to have to be a logistics expert to build this in a simple and intuitive way for the admin as well as for the public-facing project link in the event that the user wants to build their own split shipments.

# Files

Now I'm going to speak in regards to the file section on a project.

* The project files are essentially the starting files, just what the client has given us, just a pretty much a dump ball.  
* Decks is if we download a creative request deck and we save it in there. When a user drags and drops a file in the decks section, they should be prompted if they can add any notes to that, for example, a version of that deck, etc.  
* Client art is essentially a lookup to the client's artwork library, where you will see in the client's artwork library there are multiple folders. Those are linked. If I was in the client's tab on the left navbar and I selected a client, I should be able to see their client art. The starting folders for any client are going to be branding and logos mainly, and then we will save designs and folders within there. When the user on a project is selected and the user selects client art, it should be a direct reflection from their client art within their client tab. That way users can see and toggle within their client art and folders within it, etc.  
* Client Submitted: this is for when an admin user has built a project but does not have, and maybe they have a mockup but they don't have the art files yet or any artwork related to a product on a project. This is where, when we share the public-facing project URL, our client will upload their artwork and relate it to a product or a decoration location, and it will come here. An admin user will clearly be able to see that file, be able to download it, be able to see what product or decoration location it's related to, etc.  
* Miscellaneous: this is just Miscellaneous project files. For example, someone might upload a CSV or something of that nature.

# Orders

Okay, now it's time to talk about the Orders tab. Currently, it doesn't make a lot of logical sense. I need this extremely polished and refined.

The idea of an order is that an order is the individual products and their shipping costs, the art files related to those products, and their decoration locations. The cost of the decoration, the sale amount, and all of the products on a project are parsed out into individual orders here. Some may have certain enhanced dates. That's one thing to note: I didn't talk about that previously. We need to add a ship date in the Timeline and Production section of a project. That ship date may apply to all products, but then the user needs to be able to override that on the per-product level because some products may ship on a different date and have different enhanced dates.

Going back to the Orders tab, it should be essentially all of the order's details. Right now, it is just a small list. It's a window that pops open and gives you very limited information. It should be a full redesigned experience, and you should be able to see all of the order details right there:

* The total sale amount  
* The profit  
* The ship date  
* The enhanced date  
* All of the ARC files associated with that product  
* The primary image  
* Any files associated with that product

Be able to still access all of the files from that project. I'm thinking instead of right now, where you click it and it's a small hover out. I'm thinking that it should be the same experience and the same UX as a project, where you click it and it has a three-quarter hover out. You see all the details, and it's laid out the same, but the only difference is that it's all of the details related to that specific product.

At this point, order entry needed a representative, an internal representative, to click that record, see all of the details, all the supporting art files, all the supporting information, and see it right there. Then they are going to take that and they're going to manually enter it into Salesforce. They're going to need to be able to quickly download the files to their desktop, whatever they need to do. There should be a button that says "Mark as entered", and that would move it into entered Salesforce. It's now been entered, and the concept is that when it has been entered into Salesforce and the person marks it as entered, that will trigger an email to the client that their order has now been entered and they can see the attached sales order.

Here's the interesting part: the sales order public-facing view is going to be a link that derives from Salesforce. In order for an order to go from order entry needed to enter in Salesforce, that field must be filled out, because when, or at least it might be, a PDF. The concept is that right now I'm going to speak in regards to our existing flow behind the scenes, but this application is essentially a wrapper to what's going on behind the scenes. If a user is going to look at this record and manually enter it into Salesforce and in the Boundless software, Boundless currently would send them an email notification that their order has been confirmed and they can track it in the Boundless software. That is what we do not want. We want them, our user, to track it in our proprietary software, which is this app that we are building.

The idea is that we would see the record manually or enter it into Salesforce, and then it would now have a sales order associated with it and it would be trackable. It would be marked as in production. We can remove "entered Salesforce" completely, because the order entry needed, once it has been entered, it is now in production.

At this point, the main order contact on the project would receive an email that says, "Your order has been confirmed, and the attached PDF sales order is going to be the sales order from Salesforce that the user uploaded to the order record behind the scenes when they were manually entering it. They can track their order and all the other orders there."

We also need to think about the shift. When I select an order, I need to be able to create shipments, and it would be the tracking, ideally. I'd like to simply paste the tracking in, and artificial intelligence would look up all the tracking details, the ship date, the estimated arrival date, etc. I would be able to click Send to Client, and the client would receive a shipment email that their order has shipped.

Another thing to note is that we need to add a field called "between in production and shipped" called "partially shipped". The user within orders needs to be able to add shipments to an order and mark it as partially shipped or shipped. If it's partially shipped, that means that half of the order, for example, may have shipped. If it's shipped, that means it's fully shipped. Through artificial intelligence or whatever, those shipments need to be tracked until they're delivered. Once they're marked as delivered, then it would be moved into ready for invoicing.

On the backend, so you're fully aware, someone in Salesforce is going to see this record and send it for my approval via email. For the invoice, I'll then take that invoice PDF. I will upload it to this record in our software, and I'll click Send Invoice. That will send the client an email that says, "Your invoice is ready for order, whatever, blah, blah, blah." They will click it and see the invoice. It will take them into their portal. This is all through magic links, but it'll take them into their portal where they can see that order and the invoice associated with it. They'll be able to see everything. Now it will then be marked as invoiced. At that point, the life cycle is fully completed.

Another thing to note above that I forgot to mention is this SOP when it comes to invoicing is very particular and very true: This is just very complex because I want to minimize what a human has to do. In summary, these orders are going to have to be manually entered in the Salesforce, and we're going to turn off any sort of notification to send to our client from Salesforce. The user is going to have to take that PDF and upload that sales order PDF to an order and then send it to the client. They're going to have to have an estimated ship date for them to track their order, and I'm trying to minimize all of this because that's a lot for one human to remember. It is to go enter it into Salesforce and then come back here and then enter in the ship date, the estimated enhanced date or delivery date. Like all that information, upload the PDF, click mark as marked as in production. Once it ships, the user is going to have to manually enter this.

I'm thinking what I'm going to do is, because we have a dedicated person inside Boundless, their job is order management, but they're not allowed to use third-party software like this. They're simply using Salesforce. I can instruct them to:

* When an order is entered, I want you to email the sales order and these details to this inbox.  
* When a shipment is done, I want you to email it to this inbox.  
* When something is ready to be invoiced, all invoices go to this inbox.

Essentially, I want artificial intelligence to scrape all of that information and be able to associate it with the order record perfectly. I really need your help figuring this out. This is so high level and complex, but I need it very simply done.

Ideally, I would love to redesign the orders page to where we can have a dedicated inbox that the Boundless team can email things in. Through artificial intelligence, it can identify that that's a sales order related to an existing order in our software, or that's an invoice with a pay link related to an order in our software, etc.

This is extremely high-level complexity, and it is your job to create this absolutely perfectly, to where this system can run in tandem with all of your knowledge that you know about the backend. With what's going on in Salesforce, while maintaining that our user, our client, never logs into Salesforce or gets any sort of Salesforce email. It keeps them contained specifically in our app fully.

# Creative Requests on project level

I'm going to speak in regards to creative requests. The user, right now, the creative requests don't make a whole lot of sense. I mean, they do, but they also don't.

Let me start with the intentions of a creative request. A creative request is a request that a user is going to make on a project so that our creative department can make that. You understand the flow right now. Our creative department only takes these requests via email. They are going to rely heavily on a public-facing link that we send them via email, and they can see:

* the entire request  
* the overview  
* the supporting files that they can download  
* the due date  
* they can upload a version, which is literally just a URL, because they use a totally different application  
* the application that they use is through pitch.com

So basically, their version of a draft is to upload this link and maybe make some notes. That's pretty much it for their side.

On our side, it's our job to create the creative request. Right now, it has a title and it's the type. I want the user to be able to enter their own, to select from these or create a new option there, because the type right now really should be:

* a branding deck  
* a tier A product deck  
* a tier B product deck  
* a tech pack  
* re-vector or single mock

Those are the creative requests

When a user creates a creative request, it should open up and require them to name it. They need to select the initial draft date and the overall due date. There should be a full description. All this should be editable to the user. They should be able to upload attachments and also add a note to each attachment. For example, they might drag and drop something and then associate a note with that, that it goes with this file, et cetera, et cetera. Any supporting URLs as well.

Now, the version history is whenever the graphics team comes back and when they apply the deck URL from the app that they use, which is pitch.com. They'll take the URL and they'll paste it in, and it will be a version. They can add some additional notes to that version, et cetera, and then they save it and it's marked as ready. The user on our side, the admin-facing user, obviously presents that to the client via email. There's no real action that needs to happen within the app, but if there are any edits requested, they will create an edit request. It will be in progress or completed, and then they will reshare this design or this creative request URL with our graphics team and let them know that I've made the edit request here. If you can make the changes and re-upload the most recent version, et cetera.

There is an attachments section right now, which I do like, but I'm thinking that there should be a files section instead of attachments. Each one of these files, the user should be able to upload the file and add an additional note to that file if they so choose. It should mimic the file section on a project. It'll have sections, so for example it'll be like:

* Provided files  
* Print files  
* Maybe miscellaneous

Allow the user to make folders of files or tabs within there.

Your goal is to build out an experience where a user can:

1. Make a creative request  
2. Give a very quick overview  
3. Upload supporting reference files within the file section  
4. Reference files  
5. Client-provided files

They can select the information, provide that to a creative person, a designer who could see everything. They can upload drafts against it and mark it as complete, where the requester sees that it is complete and they take that URL or the assets and provide them to the client.

If any edits and changes are needed, the user makes an edit request and uploads any supporting documents for that edit request. They will then share the public-facing URL of this project back to the Creative Department, where they will look at it, download any new provided assets related to that edit request, make the edits, mark it as complete, and it continues in that cycle. That is the idea behind this entire section.

In the description of a creative request, give the user an AI assistant option. Where an AI assistant will ask them about the project, and they can freely type and then the AI assistant fills out the “Description” section.

Your job here is to understand the entire workflow because myself and my team are going to be using this application, creating these creative requests, showing a public-facing URL to a graphic designer who will need to be able to download all of these, upload a new version (which might be a link; it might have some supporting assets). They should be able to change the status to complete. Then we should be able to see what they've uploaded, downloaded, and give it to the client, whatever. That all is apart from this app, but if we need any edit requests, we can make those edit requests with supporting art files, etc. Your job is to act as if you are a Creative Director Professional and you are developing this out to a perfect experience.

# Products

Now I'm going to talk to the Products tab right now. Currently, the way the app is set up, the current product is essentially only a contract product. The idea is that a contract product has the Basics:

* the Product Name  
* Internal SKU  
* and it has the Blank Costs

Right now, the user needs the ability to add the sizes available and then those blank costs. The user needs the ability to add the variants. The user needs the ability to add an image associated with the color. Currently, it's an image URL. That is incorrect. It should be an easy way to just drag and drop. Hopefully, in this app, I would love for the color swatch to populate because the app analyzes the image that is being uploaded. That way, a user can take a quick screenshot, drag and drop, and it recognizes it, shows the color icon, and then the user enters the name and then repeats and adds as many colors as they want.

Decorations: you can completely remove decorations right here when entering, when creating a new product. The decorations can be completely removed because that is controlled on the decoration location level. When you are adding a product to a project and then you're adding the decoration to that now.

The interesting concept here is that right now we have mostly just contract product in this software. A contract product is simply a raw cost product that we are applying a decorator matrix to, with fixed costs and variable costs now. An all-in product would be a product, for example, a coffee mug that has its variance, would be its sizes (2 oz, 3 oz, 9 oz, whatever). It would not have blank costs. It would not have that. It would just be the Basics, the variants, and then it would have pricing or price breaks. It would be from left to right: your quantity breaks, and then the row would be the per unit charge. For a coffee mug, whatever, but basically we need to. It's your job; you are the merchandising professional software expert in all of this.

I want you to create a beautiful concept of a contract decorated product as well as an all-in product. That way, the user can quickly toggle between the two and add them to their projects and present them to the client. All costs are associated also, whatever, thinking about an all-in product, for example a coffee mug. That coffee mug might have a setup cost per color, and there might be a cost and a sale price. This would be if that information was controlled within the product catalog; then it can populate on the project level, because this and that would help the user create projects very quickly, etc.

Essentially, I want you to create the "Add a product" experience so incredibly efficient, easy, and simple for a user to create a contract product, which is, in 99% of cases, an apparel product. That could be a hat, that could be a t-shirt, or whatever, and it has size variance. Those sizes might cost different amounts, et cetera. It has your basics, et cetera.

A decorator matrix is applied to that on the project level when they're adding a decoration location. Then an all-in product: I want you to create an incredible experience making an all-in product where it has:

* a primary image  
* the colors available  
* drag-and-drop ability  
* scanning ability for the color swatch  
* quick variant entry

and then it's saved to the catalog for future use. One thing to consider about both:

This is where it gets very complex, and I'm only going to explain the problem. Your job as the professional is going to be to create the solution. The problem is that the same product might cost differently from different suppliers. For example, I might order or not order, but there will be a blank Gildan 5000 that might be a certain cost through S\&S Activewear. That same exact product might be different through another vendor. We'll talk about vendors later, but I need you to solve that problem within the product catalog.

That is certain: you can have the same kind of product; it would just be from a different supplier. It is extremely important that you create this on the project when a user is adding a product to a project. You add this functionality there, so they understand that they are adding up that blank from that supplier or whatever it may be.

All in all, your job as the product catalog creation specialist professional is to take the products tab, make a beautiful experience between contract and all-in product, quick creation, and make sure that it also runs in conjunction with when a user is working on a project. All of this must reflect and work together.

One important thing to note for an all-in product, like a coffee mug or a journal or anything like that, is that when the user is creating the sale price, they are going to have our supplier. For example, they might have the promotional products website open and they are copying and pasting those price breaks, then the sale prices, and then they're going to see what code it is. It's your job to be a promotional products professional to understand the codes. For example, if a price code is a C, it's a 40% discount now, which would equal our raw cost, or if a setup is on a G, then that's 20%. You need to do your investigation to understand the industry terminology when it comes to industry price codes, because an all-in product is primarily an ASI or PPAI product.

Since we do not have a Promo Standards integration, the user is going to have to really go off of the sale price and your mathematics to calculate the raw cost. Your mathematics to calculate the raw cost is solely dependent on your education and understanding the industry price codes and the mathematics in order to calculate that raw cost for that all-in product.

So when a user is creating an all-in product, they're going to copy and paste and create the rows and the columns for the price breaks and everything. They're also going to need to enter the sale price and select the price code that the first column, second column, third, fourth, and fifth are on. They can either be on the same price code or on different price codes.

You are going to have to build this logic to make it so easy for a user to create an all-in product. Copy and paste all the sale pricing over, define the price codes, and what price code discount code it's on. When they add that product to a project, in order to calculate our raw cost, those price codes are going to be important to calculate our actual cost. This is a very crucial thing.

# Creative Requests (main tab)

On the creative requests main tab, the idea is that this is all of our creative requests related to all of our projects, so you can see them all. The user should be able to click them and open it up and see all the files, everything that we've talked about: the edit requests, the public facing URL. They should be able to edit it, mark it as approved, or mark it however they need to be. A lot of these features are currently still there, but this should be a quick and intuitive way to see where all of our creative lists are by status. Even a Kanban view would be nice, maybe upcoming that are due, etc. I also want a public facing URL for all creative requests here. That way we can share this with our creative team to review.

Essentially, all this is a reflection of all the creative requests related to all of the projects. Your job as the professional is to create a beautiful and intuitive way to see all of them, click them, and give public-facing ability, editability, everything that you possibly think a user would need.

The user should also be able to create a creative request from the main creative tab as well and link it to a project, an existing project, or create a quick pro, or be able to create a project while creating a creative request. Your job as a professional is to ensure that all the required fields are there, the required workflow and concept is completely perfect.

# Decorations

Now we're going to talk about the Decorations tab. The Decorations tab is currently designed in such a way that I'm going to start with the design of just the landing page. It says:

* Decoration types  
* Price breaks  
* The number of setup charges  
* The number of run charges

These KPI metrics are not important. This should, in theory, be decorators, and this is where the decorator matrices live, which is what you have now.

The main thing that I see wrong with this is that this should be on almost a primary matrix level, where the matrix is related to a vendor. A vendor type would be a decorator. You select that object, and then you can see all of the matrices within that vendor.

The idea is that the user comes into decorations, selects the vendor, and then creates new matrices or edits a matrix. It is of the absolute highest importance that you create the logic between the pricing that is shown here and the mathematics when a user is adding a decoration location to a product, to a contract product or any product. Now, if it is a contract product on a project, it will be looking up one of these decorator matrices. If it is an all-in product, it will not, if that makes sense. If it's an all-in product, it already has preset price breaks within the products module or on the side that we know is our cost and sale price, which I did not mention earlier in the products. That is extremely important for a

The concept is that whenever a user is on a project and they click a product and they select a contract product, then when they select their decoration locations, they can choose the decorator matrix from this area and it populates.

As we spoke earlier, in some cases the price breaks might be different for each decoration location, but the primary location is going to be your primary price breaks. You are going to do the mathematics to distribute the secondary locations' price breaks and ensure that cost and margin are protected, as well as price breaks are protected, to give the end client an experience as if there are incremental price breaks.

But currently, when I select, for example, I select Culture Studio Screen Print, I can control that screen print price grid. The database structure needs to go one more level deep. I want to select Culture Studio, and then I want to see all of their decoration matrices within there.

# Vendors

Okay, now we are going to talk about the vendors section. This is just simple vendor management. If it is a supplier, I want to be able to edit the quality score, maybe some quick notes about them. I want to be able to edit this information. I like currently how you have no pricing matrices related to S\&S Actiware, for example, because obviously that is not a decorator. One-time rate and the KPIs when a supplier is selected: I am not worried about some of those things. Let's just disregard the performance scoreboard right now completely, but I do need to be able to edit these fields, like the notes. I'd like to add a simple contact to a supplier:

* first name  
* last name  
* email  
* phone number  
* their title

and then just very basic supplier management.

For when a decorator is selected, I do like the performance scorecard. I would like a section called "Performance" where you can log an issue, and we will talk about that more in the tickets tab. Essentially, I don't want to log an issue. I want to be able to see any tickets that are related to this decorator, which we'll talk about later.

Once again, the performance scorecard: we can remove that and just see all the related tickets with this decorator. Average lead time is good. The on-time rate and reprint rate: I don't know that we're going to be able to calculate these KPIs right now, so I'm not sure that they're very important for version one of this application.

I need to be able to edit these fields. You want to be able to add simple contacts to each vendor, like I mentioned earlier:

* first name  
* last name  
* email  
* phone number  
* their title  
* maybe some general notes

We need to be able to edit this, edit a record, in which we cannot edit records right now.

I'd also like to see any projects, a section of projects that are related. If a project is active or completed or anything and related to this decorator or the other vendor, I want to see the projects that are related to them.

# Tickets

Now I'm going to talk in regards to the tickets section. The ticket section is intended so that the user should be able to create a ticket from this section and link it to a project or an order. Just refine this a little bit better, but right now it says "full ticketing coming in round 2." That's not correct. I want you to fully build out a ticketing solution that is linked to projects and orders and make it very, very simple so that a user can create a ticket on this, or they can create it while looking at the project. Keep in mind that, on a project or an order, when it is selected and it opens up, we are going to need a tickets section where these are linked back and forth.

Keep in mind that when creating a ticket, the user is going to obviously give it a ticket name, its priority, the fault, the requested action, the resolution status, and any other statuses or items that I'm not thinking of that you can think of as your job as a ticketing professional to build that out and make sure once again that it reflects on a project and an order as well as in the tickets module itself.

We also want the ability to have a public-facing view of the ticket. That way we can share this with a vendor in the chance that it is the vendor's fault. I want a public-facing URL view so they can see it, review the ticket, download any supporting files that we've provided to prove that there's a mistake. I want to give them a section to add comments and responses, as well as a next action step. Is it a reprint? Is it a refund? Whatever it may be, and they can submit that. On this admin-facing side, I want my user to be able to manage tickets completely.

# Settings

For the settings section, everything looks good except I want to remove products and decorator matrices because those are handled on the left navigation bar.

# Product Catalogue

For the product catalog, the idea is decent, but right now it should be the ability to see the primary images and all the color options. This is a customer-facing experience of our product catalog, and essentially they are curating their own project.

The concept is that they can see the product and toggle between the decoration methods, screen print or embroidery, for example. If it's a coffee mug or something like that, I'm not sure how that would be handled. You're going to have to help me with that because I did not think about that.

When we are in decorator matrices, a matrix won't apply to a coffee mug, but a coffee mug will have a decoration type. Earlier I told you to remove the decoration types from a product; that's not necessarily the truth. A decoration type should still remain because a decoration type might be applied to an all-in product. It is extremely crucial that you understand that.

But going back to the product catalog, it should be an experience that's so easy. If they select screen print, they can create their locations, select from the print colors. If they don't know, it's okay; just choose a couple, and they can upload their artwork per location, or maybe they can upload all artwork associated with each location. Just make it very, very easy, the best possible merch ordering experience ever, because what we're trying to capture with this is to marry e-commerce with working with a true agency that knows what they're doing and give ordering ability a very high level ordering but so easy. Essentially, the catalog right now is pretty vanilla and bare bones. I wanted it to be simple but yet effective.

In the products module, when logged in as an admin, there's going to be categories and all those things. This is just an outward showing of that. You, as the product tech specialist, are going to have to ensure that all the possible details are mapped one-to-one for the front-facing user experience as well as the admin product inside of our database. We do not want fields or things like that showing if they are not actually real.

The concept of the product catalog should be that a user can look at a product and add it to a project, and then name the project, enter their shipping and billing (is shipping and billing the same, yes/no), company name, email, their primary contact information, any additional notes, etc. If they're an existing client, this submission will come in. It will show a success message, thank you, we've got your project details, and it will come into the Projects tab in an opportunity, and on the front of the record, where many of them say Direct, Referral, or Website, there's really only this one that would say Website, but it's worth noting that I cannot edit that field right now. I don't see where I can edit the Origination, Destination, or whatever we want to call that. The Lead Source is probably what we'd want to call that. The Lead Source. I don't know where I can edit that on a project right now, so it's pointless that it's on the front of the record.

Give me the ability to edit that when I have a project selected, but the concept is that someone can go to the catalog and curate a merch order and submit their details and move on. Keep in mind this is going to be embedded. The catalog is going to be embedded on my primary website. When someone clicks Products, it'll be like, "Welcome to our catalog. Here's how to use it. Curate it. Do you have questions? Let us know." This catalog should be the best merch catalog out there.  
