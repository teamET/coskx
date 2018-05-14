import selenium 
from selenium import webdriver
import seleniumrequests
from seleniumrequests.auth import HTTPDigestAuth

user_agent = 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.66 Safari/537.36'
dcap = {
    "phantomjs.page.settings.userAgent" : user_agent,
    'marionette' : True
}

driver=seleniumrequests.PhantomJS(executable_pathphantomjs-2.1.1-linux-x86_64/bin/phantomjs")

val=driver.request('GET',"https://google.com/")
print(val.text)
"""
driver=webdriver.PhantomJS(executable_path="phantomjs-2.1.1-linux-x86_64/bin/phantomjs",desired_capabilities=dcap)
driver.get("https://www.python.org/")
print(driver.title)
driver.quit()
driver.close()
"""


