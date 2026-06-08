# College field mapping and visibility

This document records how the primary college data fields are surfaced in the product today.

## Public detail page
- College identity: name, location, district, university, NAAC grade, official website
- Verification metadata: verification status, last verified, source URL
- Placement data: average package, highest package, recruiters
- Fee data: tuition, hostel, transport, other notes
- Branch coverage: available branches and ECET cutoffs
- Campus data: facilities, gallery images, cover image

## Admin editing flow
- General profile: name, slug, location, district, university, NAAC grade, website, status
- Verification metadata: verification status, last verified, source URL
- Placement and fee structure: average package, highest package, recruiters, tuition, hostel, transport, other fee note
- Branch and ECET data: branches, ECET cutoff rows
- Media: cover image and gallery image management

## Notes
- The detail page now renders the ECET cutoff snapshot directly from the existing college dataset.
- Facilities and fee notes are now editable in the admin form to keep the profile aligned with the imported Excel-style data.
