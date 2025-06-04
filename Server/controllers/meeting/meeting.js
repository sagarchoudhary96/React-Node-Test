const MeetingHistory = require("../../model/schema/meeting");
const User = require("../../model/schema/user");

const add = async (req, res) => {
  try {
    const meeting = new MeetingHistory(req.body);
    await meeting.save();
    res.status(200).json(meeting);
  } catch (err) {
    console.error("Failed to create Meeting:", err);
    res.status(400).json({ error: "Failed to create Meeting" });
  }
};

const index = async (req, res) => {
  query = req.query;
  query.deleted = false;
  const user = await User.findById(req.user.userId);
  if (user?.role !== "superAdmin") {
    delete query.createBy;
    query.createBy = new mongoose.Types.ObjectId(req.user.userId);
  }

  let allData = await MeetingHistory.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "User",
        localField: "createBy",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        createdByName: {
          $concat: ["$users.firstName", " ", "$users.lastName"],
        },
      },
    },
    {
      $project: {
        users: 0,
      },
    },
  ]);

  const result = allData.filter((item) => item.createBy !== null);
  res.send(result);
};

const view = async (req, res) => {
  try {
    let response = await MeetingHistory.findOne({ _id: req.params.id });
    if (!response) return res.status(404).json({ message: "no Data Found." });
    let meetingResult = await MeetingHistory.aggregate([
      { $match: { _id: response._id } },
      {
        $lookup: {
          from: "User",
          localField: "createBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $lookup: {
          from: "Contacts",
          localField: "attendes",
          foreignField: "_id",
          as: "attendes",
        },
      },
      {
        $lookup: {
          from: "Leads",
          localField: "attendesLead",
          foreignField: "_id",
          as: "attendesLead",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          createdByName: {
            $concat: ["$users.firstName", " ", "$users.lastName"],
          },
          attendes: {
            $map: {
              input: "$attendes",
              as: "attendee",
              in: {
                _id: "$$attendee._id",
                fullName: "$$attendee.fullName",
              },
            },
          },
          attendesLead: {
            $map: {
              input: "$attendesLead",
              as: "lead",
              in: {
                _id: "$$lead._id",
                leadName: "$$lead.leadName",
              },
            },
          },
        },
      },
      {
        $project: {
          users: 0,
        },
      },
    ]);
    res.status(200).json(meetingResult[0]);
  } catch (err) {
    console.log("Error:", err);
    res.status(400).json({ Error: err });
  }
};

const deleteData = async (req, res) => {
  try {
    const result = await MeetingHistory.findByIdAndUpdate(req.params.id, {
      deleted: true,
    });
    res.status(200).json({ message: "done", result });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const deleteMany = async (req, res) => {
  try {
    const result = await MeetingHistory.updateMany(
      { _id: { $in: req.body } },
      { $set: { deleted: true } }
    );

    if (result?.matchedCount > 0 && result?.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Meetings Removed successfully", result });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Failed to remove Meetings" });
    }
  } catch (err) {
    return res.status(404).json({ success: false, message: "error", err });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
