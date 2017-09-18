import express from 'express';

import DashboardDataCollector from 'libs/dashboardDataCollector';

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ hello: 'test' });
});

router.get('/coverage', (req, res) => {
  DashboardDataCollector.instance.getExecutionStatus();
  DashboardDataCollector.instance.getCoverage()
    .then((coverage) => {
      res.send({ coverage });
    });
});

export default router;
