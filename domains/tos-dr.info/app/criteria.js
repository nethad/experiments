$(function(){
  window.criteria =
       { 'BY':         //attribution. Like the 'BY' in CC licenses
           { options: ['grey', 'red', 'green']
           , text:
             { red:    'We own data you submit'
             , green:  'You own your own data'
             }
           }
       , 'PRIV':       //PRIVacy. Whether you keep sole control over the data you own
           { options: ['grey', 'red', 'green']
           , text:
             { red:    'You have to license your data to us'
             , green:  'We will not get a license beyond what is necessary for running the service'
             }
           }
       , 'DEL':        //about data retention vs. DELetion
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'We might keep a copy of your data, even if you don\'t want us to',
               orange: 'We will keep a copy of your data unless you explicitly say otherwise',
               green:  'We will delete both your primary data and your secondary data quickly after you close your account'
             }
           }
       , 'END':        //what happens when we END your service
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'we do not provide an appeal procedure in case we end our service to you'
             , orange: 'We may suspend your account at any time, but will allow you to appeal before an independent court or panel'
             , green:  'We will not end or suspend your account, unless required to do so by law'
             }
           }
       , 'CEN':        //what happens when we CENsor your data 
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'We do not provide an appeal procedure in case we censor your data on our service'
             , orange: 'We may censor your primary data at any time, but will allow you to appeal before an independent court or panel'
             , green:  'We will not censor your primary data except when required to do so by law'
             }
           }
       , 'GOV':        //what happens when the GOVernment (law enforcement) wants to see your data
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'We will give law enforcement access to your data even when they don\'t have a subpoena',
               orange: 'We will only give law enforcement access to your data when they have a subpoena / we will let you know about it first',
               green:  'We will try to help you get a chance to defend yourself when law enforcement requests access to your data'
             }
           }
       , 'OPP':        //You down with O.ther P.eople's P.urposes? Or should we stick to using your data to serve only your purposes?
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'We will use your personal data for the purposes of people other than yours'
             , orange: 'We may use aggregated data for the purposes of people other than yourself, but then you will not be identifiable'
             , green:  'We will not use your primary nor your secondary data for serving any purposes other than yours'
             }
           }
       , 'DL':         //Data Liberation
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'You can not export or import your data'
             , orange: 'You can export your primary data at any time, but to a format that even we ourselves don\'t support for import'
             , green:  'You can import and export your primary data at any time'
             }
           }
       , 'EQ':         //EQuality
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'Whether this service is available to you may depend on your location, race, gender, nationality, residence, political views, religion, sexual orientation, or criminal record'
             , orange: 'We are actively and demonstrably working to make this service available to more human beings, regardless of their location, race, gender, nationality, residence, political views, religion, sexual orientation, and criminal record'
             , green:  'We are colour blind to your location, race, gender, nationality, residence, political views, religion, sexual orientation, and criminal record'
             }
           }
       , 'ANON':       //using disposable pseudonyms for each session (ANONymity), or one multi-session pseudonym (nickname)
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'You have to give us your real identity, uniquely linking your account to you as a physical person'
             , orange: 'We allow you to use nicknames towards other users, as long as you do tell us your real identity'
             , green:  'We allow you to use a pseudonym, whether used during multiple sessions, or only once'
             }
           }
       , 'DIST':       //whether you can install your own node of this service, and interact with people on other DISTributed nodes like the current one 
           { options: ['grey', 'red', 'orange', 'green']
           , text:
             { red:    'This is the only instance of this service. Either the source code is secret, or you\'re not allowed to run your own instance of it'
             , orange: 'The software behind this service is FOSS. Be aware though, that each node forms a restrictive island of user interaction'
             , green:  'This service is distributed; using a a different instance will not give you significant loss of interaction with other users'
             }
           },
        'LOC':        //where the applicable court of law is LOCated, not sure about the exact wording of the ratings yet
          { options: ['grey', 'red', 'orange', 'green'],
            text: {
              red: 'The court of law is located in an oppressive regime',
              orange: '',
              green: 'The court of law is located in a democracy where you can defend yourself'
            }
          }
       }
})
