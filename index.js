/**
 * @param {import('probot').Probot} app
 */

const accountSid = "";
const authToken = "";
const client = require("twilio")(accountSid, authToken);

// A Twilio function to send SMS.
function SMS(comment) {
    client.messages
        .create({
            body: comment,
            messagingServiceSid: "",
            to: "",
        })
        .then((message) => {})
        .done();
}

module.exports = (app) => {
    app.log.info("Yay, the app was loaded!");

    // If there is any issue which is open, it will assign to the maintainer(s) and notify them as well.
    app.on("issues.opened", async (context) => {
        const issueComment = context.issue({
            body: "Thanks for opening this issue! We hope you enjoy contributing on this Open Source Project.",
        });

        const assignee = context.issue({
            assignees: "kartikmehta8",
        });

        SMS(
            "An issue has been created in your repository. You have been assigned this issue for further updates on this project."
        );
        context.octokit.rest.issues.addAssignees(assignee);
        return context.octokit.issues.createComment(issueComment);
    });

    // If any pull request which is opened or closed, then it will send SMS.
    app.on("pull_request", async (context) => {
        const pullRequest = context.payload.pull_request;

        if (pullRequest.state === "open") {
            SMS("There is open pull request in your repository.");
        }

        if (pullRequest.state === "closed") {
            SMS("The pull request close was successful.");
        }
    });

    // If there is a successful closure (or not) of a pull request.
    app.on("pull_request", async (context) => {
        const pullRequest = context.payload.pull_request;

        if (pullRequest.state === "closed" && pullRequest.merged) {
            SMS(
                "A pull request has been merged successfully in your repository."
            );
        } else
            SMS(
                "There is a pull request merge unsuccessful in your repository."
            );
    });

    // If GitHub actions workflow build is successful or not.
    app.on("check_run", async (context) => {
        const latestRun = context.payload.check_runs[0];

        if (latestRun.conclusion === "success") {
            SMS("The latest build in your repository was successful!");
        } else {
            SMS("The latest build in your repository got failed!");
        }
    });
};
