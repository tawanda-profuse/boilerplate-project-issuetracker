const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { request } = require("../server");

chai.use(chaiHttp);
const testPath = "/api/issues/issuetracker";

suite("Functional Tests", function () {
  test("POST issue with every field", (done) => {
    const postData = {
      issue_title: "POST",
      issue_text: "POST issue with every field",
      created_by: "az",
      assigned_to: "Joe",
      status_text: "This is a test",
    };
    chai
      .request(server)
      .post(testPath)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(postData)
      .end((err, res) => {
        const resData = res.body;
        assert.equal(resData.issue_title, postData.issue_title);
        assert.equal(resData.issue_text, postData.issue_text);
        assert.equal(resData.created_by, postData.created_by);
        assert.equal(resData.assigned_to, postData.assigned_to);
        assert.equal(resData.status_text, postData.status_text);
        assert.equal(resData.open, true);
        assert.isNumber(Date.parse(resData.created_on));
        assert.isNumber(Date.parse(resData.updated_on));
        done();
      });
  });
  test("POST issue with required fields only", (done) => {
    const postData = {
      issue_title: "POST",
      issue_text: "POST issue with every field",
      created_by: "az",
    };
    chai
      .request(server)
      .post(testPath)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(postData)
      .end((err, res) => {
        const resData = res.body;
        assert.equal(resData.issue_title, postData.issue_title);
        assert.equal(resData.issue_text, postData.issue_text);
        assert.equal(resData.created_by, postData.created_by);
        assert.equal(resData.open, true);
        assert.isNumber(Date.parse(resData.created_on));
        assert.isNumber(Date.parse(resData.updated_on));
        done();
      });
  });
  test("POST issue with missing required fields", (done) => {
    const postData = {
      issue_title: "POST",
      issue_text: "POST issue with every field",
    };
    chai
      .request(server)
      .post(testPath)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(postData)
      .end((err, res) => {
        const resData = res.body;
        assert.deepEqual({ error: "required field(s) missing" }, res.body);
        done();
      });
  });
  test("Get issues for a specific project", (done) => {
    chai
      .request(server)
      .get(testPath)
      .end((err, res) => {
        const resData = res.body;
        assert.isArray(resData);
        resData.forEach((issue) => {
          assert.property(issue, "issue_title");
          assert.property(issue, "issue_text");
          assert.property(issue, "created_on");
          assert.property(issue, "updated_on");
          assert.property(issue, "created_by");
          assert.property(issue, "assigned_to");
          assert.property(issue, "open");
          assert.property(issue, "status_text");
        });
        done();
      });
  });
  test("Get issues for a specific project with one filter applied", (done) => {
    chai
      .request(server)
      .get(testPath + "?open=true")
      .end((err, res) => {
        const resData = res.body;
        assert.isArray(resData);
        resData.forEach((issue) => {
          assert.property(issue, "issue_title");
          assert.property(issue, "issue_text");
          assert.property(issue, "created_on");
          assert.property(issue, "updated_on");
          assert.property(issue, "created_by");
          assert.property(issue, "assigned_to");
          assert.property(issue, "open");
          assert.property(issue, "status_text");
          assert.propertyVal(issue, "open", true);
        });
        done();
      });
  });
  test("Get issues for a specific project with multiple filters applied", (done) => {
    chai
      .request(server)
      .get(testPath + "?open=true&assigned_to=Joe")
      .end((err, res) => {
        const resData = res.body;
        assert.isArray(resData);
        resData.forEach((issue) => {
          assert.property(issue, "issue_title");
          assert.property(issue, "issue_text");
          assert.property(issue, "created_on");
          assert.property(issue, "updated_on");
          assert.property(issue, "created_by");
          assert.property(issue, "assigned_to");
          assert.property(issue, "open");
          assert.property(issue, "status_text");
          assert.propertyVal(issue, "open", true);
          assert.propertyVal(issue, "assigned_to", "Joe");
        });
        done();
      });
  });
  test("PUT update one field of an issue", (done) => {
    chai
      .request(server)
      .get(testPath)
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .put(testPath)
          .set("content-type", "application/x-www-form-urlencoded")
          .send({ _id: id, assigned_to: "kev" })
          .end((err, res) => {
            const resData = res.body;
            assert.deepEqual(resData, {
              result: "successfully updated",
              _id: id,
            });
            done();
          });
      });
  });
  test("PUT update multiple fields of an issue", (done) => {
    chai
      .request(server)
      .get(testPath)
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .put(testPath)
          .set("content-type", "application/x-www-form-urlencoded")
          .send({
            _id: id,
            assigned_to: "kev",
            issue_title: "updated issue title",
          })
          .end((err, res) => {
            const resData = res.body;
            assert.deepEqual(resData, {
              result: "successfully updated",
              _id: id,
            });
            done();
          });
      });
  });
  test("PUT update an issue with the id field missing", (done) => {
    chai
      .request(server)
      .put(testPath)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        assigned_to: "kev",
        issue_title: "updated issue title",
      })
      .end((err, res) => {
        const resData = res.body;
        assert.deepEqual(resData, {
          error: "missing _id",
        });
        done();
      });
  });
  test("PUT update an issue with no fields to update", (done) => {
    chai
      .request(server)
      .get(testPath)
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .put(testPath)
          .set("content-type", "application/x-www-form-urlencoded")
          .send({
            _id: id,
          })
          .end((err, res) => {
            const resData = res.body;
            assert.deepEqual(resData, {
              error: "no update field(s) sent",
              _id: id,
            });
            done();
          });
      });
  });
  test("PUT update an issue with an invalid id", (done) => {
    const id = "invalidId";
    chai
      .request(server)
      .put(testPath)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: id,
        assigned_to: "kev",
        issue_title: "updated issue title",
      })
      .end((err, res) => {
        const resData = res.body;
        assert.deepEqual(resData, {
          error: "could not update",
          _id: id,
        });
        done();
      });
  });
  test("DELETE delete an issue", (done) => {
    chai
      .request(server)
      .get(testPath)
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .delete(testPath)
          .set("content-type", "application/x-www-form-urlencoded")
          .send({ _id: id })
          .end((err, res) => {
            const resData = res.body;
            assert.deepEqual(
              { result: "successfully deleted", _id: id },
              resData
            );
            done();
          });
      });
  });
  test("DELETE delete an issue with invalid id", (done) => {
    const id = "invalidId";
    chai
      .request(server)
      .delete(testPath)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ _id: id })
      .end((err, res) => {
        const resData = res.body;
        assert.deepEqual({ error: "could not delete", _id: id }, resData);
        done();
      });
  });
  test("DELETE delete an issue with invalid id", (done) => {
    const id = "invalidId";
    chai
      .request(server)
      .delete(testPath)
      .end((err, res) => {
        const resData = res.body;
        assert.deepEqual({ error: "missing _id" }, resData);
        done();
      });
  });
});
