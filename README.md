# Geo576MidtermProj

Link to website: https://kampjaco.github.io/Geo576MidtermProj/

This project was created to allow travel enthusiasts to log their travels taken throughout their lifetimes.  Users fill out a form linked to the map for each attraction visited on a trip, and a personalized point appears at the location of each attraction.  When a point is clicked, a popup appears giving information about the attraction from the form the user submitted - Trip Name, Attraction Name, who logged the attraction, Date Visited, a description of the attraction, and an optional photo.

In addition to the user logged points, the map also features a variety of widgets.  A button with a 'layers' icon located on the left side of the UI holds buttons to change the basemap layer, locate the current posistion of the user, and a search bar to search for any location.  The basemap layers and search capabilities are provided by Esri.

The user can also filter mapped attractions by three categories: Trip Name, who the point was logged by, and year the attraction was visited.  These capabilities are hidden behind a button with a 'filter' icon, located underneath the 'layers' button.  The following icons correspond to the attribute they are filtering:
- Car: Trip Name
- User: Logged By
- Calendar: Year Visited
Users can filter the points by at most one field from each attribute.  When creating a query across multiple attributes, the "AND" keyword is used to complete the query.  Here a couple of examples of allowed and not allowed queries:
- Allowed
    - WHERE trip_name = 'Grand Canyon'
    - WHERE trip_name = 'Grand Canyon' AND logged_by = 'Jane Doe'
    - WHERE trip_name = 'Grand Canyon' AND logged_by = 'Jane Doe' AND date_visited = '2020'
    - No filter!  Just enjoy all the data
- Not allowed
    - WHERE trip_name = 'Devil's Lake' AND trip_name = 'Pacific Northwest'
    - WHERE date_visited = '2010' AND date_visited = '2015'
The filters for each attribute are dynamically updated from each entry a user submits to the form linked to this app.  The filters only include distinct values from each of the attributes.  The user will know if a value from an attribute is a part of the filter by if the value is bolded.  Users can select another value in the same attribute to change the filtered value, or select the filtered value again to remove it from the filter.

This app was designed to be used on mobile devices first.  An efficient user would visit an attraction, fill out the form, snap a picture, and use their device location services to pinpoint the attraction location.  However, this is not always possible, especially if the attraction is in a remote area with little to no cell reception.  The app can be used on a laptop, allowing users to retroactively map points they were not able to while at the attraction.

For any questions about this project, please write to: mailto:jacob.kampf7@gmail.com
