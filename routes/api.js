"use strict";
const db = require("./../db");

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      const filter = { project };
      for (const el in req.query) {
        filter[el] = req.query[el];
      }
      db.findIssues(filter, (err, data) => {
        if (err) {
          console.log(err);
          return res.json({ error: "server error" });
        }
        return res.json(data);
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      const newIssue = { project };
      for (const el in req.body) {
        newIssue[el] = req.body[el];
      }
      if (!checkPostRequiredFields(newIssue))
        return res.json({ error: "required field(s) missing" });

      db.createIssue(newIssue, (err, data) => {
        if (err) {
          console.log(err);
          return res.json({ error: "internal server error" });
        }
        return res.json(data);
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      const updateObj = {};
      for (const el in req.body) {
        updateObj[el] = req.body[el];
      }
      if (!updateObj._id) return res.json({ error: "missing _id" });
      if (
        updateObj.open === undefined &&
        updateObj.issue_title === undefined &&
        updateObj.issue_text == undefined &&
        updateObj.created_by === undefined &&
        updateObj.assigned_to === undefined &&
        updateObj.status_text === undefined
      )
        return res.json({
          error: "no update field(s) sent",
          _id: updateObj._id,
        });
      db.updateIssue(updateObj._id, updateObj, (err, data) => {
        if (err) {
          return res.json({ error: "could not update", _id: updateObj._id });
        }
        return res.json({ result: "successfully updated", _id: updateObj._id });
      });
    })

    .delete(function (req, res) {
      const id = req.body._id;
      if (!id) {
        return res.json({ error: "missing _id" });
      }
      db.deleteById(id, (err, data) => {
        if (err || !data) {
          return res.json({ error: "could not delete", _id: id });
        }
        return res.json({ result: "successfully deleted", _id: id });
      });
    });
};

const checkPostRequiredFields = (obj) => {
  if (!obj.issue_title || !obj.issue_text || !obj.created_by || !obj.project)
    return false;
  return true;
};
