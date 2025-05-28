/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/test-voice', async ({ view }) => {
  return view.render('test_voice_recognition')
})
router.get('/test-prompts', async ({ view }) => {
  return view.render('test_prompts')
})
router.get("prompts", "#controllers/tests_controller.index");
router.post("prompts/update", "#controllers/tests_controller.update");
router.post("test-voice", "#controllers/tests_controller.convertToForm");

//main routes
router.group(()=>{
  router.post("convert-to-form", "#controllers/patient_controller.convertToForm");
  router.post("patient", "#controllers/patient_controller.getPatient");
  router.post("visits", "#controllers/patient_controller.visits");
  router.post("forms", "#controllers/patient_controller.forms");
}).prefix("api")