# Dining panel map — before public review

Recording36.566633s,2556×1400, played end-to-end and13 chronological frames inspected. Live CSS measurements1280×720; reference design uses1440 width units.

1. 0–3s illustrated monochrome hero, dark lower wash, lower Dining title; existing rail/booking treatment retained.
2. 3–6s centered Restaurant introduction; measured1280 CSS: x395.55,w488.89,top837.33;40/1440 heading,18/1440 body;132/1440 top spacing;23 body margin;48 actions margin.
3. 6–9s asymmetric Breakfast/All Day/Drinks: left162.86,right113,gap94.14 designunits;photoheight295;second offset170.05;third offset-47.69;title32,body15/25,width352.96; View Menu alignedright.
4. 9–18s Dining Offers: Afternoon Tea,Mini Rijsttafel,Private Gathering,Romantic Dinner. Source is Swiper free-mode horizontal drag; recording pointer shifts strip left, thin understated indicator. Eachcard360 wide,gap52,height215.98 photo;alternating80.62 offset. Mobile source stacks offers.
5. 21–24s return upward to Drinks View Menu. Separate route /restaurant-menu with category fragments, not overlay. Source categories point /restaurant-menu#breakfast,#all-day-dining,#drinks.
6. 27–30s red Breakfast menu: centeredtitle,white portraitdocuments,sticky left categories/download,right dietarynotes. Scroll through complete document pages.
7. 33–36.57s category All Day Dining scrolls to its heading/document stack. Live source supplies3 Breakfast,4 All Day,12 Drinks desktoppages; mobile source provides separately segmentedpageimages, not included in this initial public implementation.

Menu desktop designunits:paddingtop60,left101,right84;leftnav200,documents736,rightnotes200;heading40,line1.15;subtitle13;pagesgap75,startmargin50;categorygap60. Document ratios preserved from actual files. Source download is a button without configured file href; demo hides it unless a valid file reference is published, rather than inventing a PDF. Terminal Dining destination is Cultures confirmed live; recording does not traverse its full expansion.
