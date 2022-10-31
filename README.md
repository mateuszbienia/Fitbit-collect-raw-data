# Fitbit collect raw data
Either Fitbit Device API nor Web API do not give direct access to raw data of the device. It gives only accelerometer data that is processed to steps and heart rate with minimum frequency of 5 seconds. Above  app was created to collect and store raw data for research purpose.

___
Data that is stored each second:
- timestamp,
- accelerometer X axis,
- accelerometer Y axis,
- accelerometer Z axis,
- Heart rate Z axis.

___
Smartwatch sends accelerometer data and heart rate data  from Fitbit device (Fitbit Versa SE) to companion app on phone. Then companion app sends data to HTTP Apache server. Data is collected each second and gets aggregated as text. App sends data each 5 minutes (at 5 minute marks so 9:15, 9:20 etc.) - I couldn't store bigger files on device because of their size and limitations of watch. 

___
App on watch shows connection status. To start collecting and sending data just press record button. Be warned that constant collection of data uses more battery than usual. 
