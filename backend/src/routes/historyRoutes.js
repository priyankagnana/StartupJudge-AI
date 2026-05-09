const express = require('express');
const authMiddleware = require('../middleware/auth');
const { list, getOne, create, update, remove } = require('../controllers/historyController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', list);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
