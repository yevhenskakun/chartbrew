import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  Chip, Button, Checkbox, Divider, Dropdown, Modal, Spacer, Table, Tooltip, CircularProgress,
  TableHeader, TableColumn, TableBody, TableRow, TableCell, DropdownMenu, DropdownItem,
  DropdownTrigger, ModalHeader, ModalBody, ModalFooter, ModalContent, Code,
} from "@nextui-org/react";
import _ from "lodash";
import { ToastContainer, toast, Flip } from "react-toastify";
import { useParams } from "react-router";
import { LuBookKey, LuInfo, LuUsers2, LuX, LuXCircle } from "react-icons/lu";

import "react-toastify/dist/ReactToastify.min.css";

import {
  getTeam, getTeamMembers, updateTeamRole, deleteTeamMember, selectTeam, selectTeamMembers,
} from "../../slices/team";
import { cleanErrors as cleanErrorsAction } from "../../actions/error";
import InviteMembersForm from "../../components/InviteMembersForm";
import canAccess from "../../config/canAccess";
import Container from "../../components/Container";
import Row from "../../components/Row";
import Text from "../../components/Text";
import useThemeDetector from "../../modules/useThemeDetector";
import Segment from "../../components/Segment";

/*
  Contains Pending Invites and All team members with functionality to delete/change role
*/
function TeamMembers(props) {
  const {
    cleanErrors, user, style, projects,
  } = props;

  const [loading, setLoading] = useState(true);
  const [changedMember, setChangedMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState("");
  const [projectModal, setProjectModal] = useState(false);
  const [projectAccess, setProjectAccess] = useState({});
  const [changedRole, setChangedRole] = useState({});

  const team = useSelector(selectTeam);
  const teamMembers = useSelector(selectTeamMembers);

  const isDark = useThemeDetector();
  const params = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    cleanErrors();
    _getTeam();
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0 && team && team.TeamRoles) {
      const tempAccess = {};
      team.TeamRoles.map((teamRole) => {
        tempAccess[teamRole.user_id] = teamRole;
        return teamRole;
      });

      setProjectAccess(tempAccess);
    }
  }, [projects, team]);

  const _getTeam = () => {
    dispatch(getTeam(params.teamId))
      .then(() => {
        dispatch(getTeamMembers({ team_id: params.teamId }));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const _onChangeRole = (newRole, member) => {
    setLoading(true);
    setChangedMember(member);
    dispatch(updateTeamRole({ data: { role: newRole }, memberId: member.id, team_id: team.id }))
      .then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
        toast.error("Something went wrong. Please try again");
      });
  };

  const _openProjectAccess = (member) => {
    if (member.TeamRoles) {
      let selectedTeamRole;
      member.TeamRoles.map((teamRole) => {
        if (teamRole.team_id === team.id) {
          selectedTeamRole = teamRole;
        }
        return teamRole;
      });
      if (selectedTeamRole) setChangedRole(selectedTeamRole);
    }

    setChangedMember(member);
    setProjectModal(true);
  };

  const _onChangeProjectAccess = (projectId) => {
    const newAccess = [...projectAccess[changedMember.id].projects] || [];
    const isFound = _.indexOf(projectAccess[changedMember.id].projects, projectId);

    if (isFound === -1) {
      newAccess.push(projectId);
    } else {
      newAccess.splice(isFound, 1);
    }

    dispatch(updateTeamRole({
      data: { projects: newAccess },
      memberId: changedMember.id,
      team_id: team.id
    }))
      .then(() => {
        const newProjectAccess = _.cloneDeep(projectAccess);
        newProjectAccess[changedMember.id].projects = newAccess;
        setProjectAccess(newProjectAccess);
        toast.success("Updated the user access 👨‍🎓");
      })
      .catch(() => {
        toast.error("Oh no! There's a server issue 🙈 Please try again");
      });
  };

  const _onChangeExport = () => {
    dispatch(updateTeamRole({
      data: { canExport: !changedRole.canExport },
      memberId: changedMember.id,
      team_id: team.id,
    }))
      .then(() => {
        const newChangedRole = _.clone(changedRole);
        newChangedRole.canExport = !changedRole.canExport;
        setChangedRole(newChangedRole);
        _getTeam();
        toast.success("Updated export settings 📊");
      })
      .catch(() => {
        toast.error("Oh no! There's a server issue 🙈 Please try again");
      });
  };

  const _onDeleteConfirmation = (memberId) => {
    setDeleteMember(memberId);
  };

  const _onDeleteTeamMember = (memberId) => {
    // deleting from teamRole
    setLoading(true);
    dispatch(deleteTeamMember({ memberId: memberId, team_id: team.id }))
      .then(() => {
        dispatch(getTeamMembers({ team_id: team.id }));
        setLoading(false);
        setDeleteMember(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Something went wrong. Please try again");
        setDeleteMember(false);
      });
  };

  const _canAccess = (role) => {
    return canAccess(role, user.id, team.TeamRoles);
  };

  if (!team) {
    return (
      <Container size="sm" justify="center">
        <CircularProgress size="lg" />
      </Container>
    );
  }

  return (
    <div style={style}>
      {_canAccess("teamAdmin") && (
        <Segment className={"bg-content1"}>
          <InviteMembersForm />
        </Segment>
      )}

      <Spacer y={4} />

      <Segment className={"bg-content1"}>
        <Row>
          <Text size="h4">{"Team members"}</Text>
        </Row>
        <Spacer y={2} />

        {_canAccess("teamAdmin") && (
          <Table shadow="none" isStriped>
            <TableHeader>
              <TableColumn key="member">Member</TableColumn>
              <TableColumn key="role">Role</TableColumn>
              <TableColumn key="projectAccess">Projects</TableColumn>
              <TableColumn key="export">Can export</TableColumn>
              <TableColumn key="actions" hideHeader>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {teamMembers?.length > 0 && teamMembers.map((member) => {
                let memberRole = {};
                for (let i = 0; i < member.TeamRoles.length; i++) {
                  if (member.TeamRoles[i].team_id === team.id) {
                    memberRole = member.TeamRoles[i];
                    break;
                  }
                }

                return (
                  <TableRow key={member.id}>
                    <TableCell key="member" className="flex flex-col">
                      <Text b>{member.name}</Text>
                      <Text size="sm" className={"text-foreground-500"}>{member.email}</Text>
                    </TableCell>
                    <TableCell key="role">
                      {memberRole.role === "teamOwner" && <Chip color="primary" variant="flat" size="sm">Team Owner</Chip>}
                      {memberRole.role === "teamAdmin" && <Chip color="success" variant="flat" size="sm">Team Admin</Chip>}
                      {memberRole.role === "projectAdmin" && <Chip color="secondary" variant="flat" size="sm">Project admin</Chip>}
                      {memberRole.role === "projectViewer" && <Chip color="default" variant="flat" size="sm">Project viewer</Chip>}
                    </TableCell>
                    <TableCell key="projectAccess">
                      {memberRole.role !== "teamOwner" && memberRole.role !== "teamAdmin" ? memberRole?.projects?.length : ""}
                      {memberRole.role === "teamOwner" || memberRole.role === "teamAdmin" ? "All" : ""}
                    </TableCell>
                    <TableCell key="export">
                      {(memberRole.canExport || (memberRole.role.indexOf("team") > -1)) && <Chip color="success" variant={"flat"} size="sm">Yes</Chip>}
                      {(!memberRole.canExport && memberRole.role.indexOf("team") === -1) && <Chip color="danger" variant={"flat"} size="sm">No</Chip>}
                    </TableCell>
                    <TableCell key="actions">
                      <div>
                        <Row className={"gap-2"}>
                          {_canAccess("teamAdmin") && memberRole.role !== "teamOwner" && memberRole !== "teamAdmin" && (
                            <>
                              <Tooltip content="Adjust project access">
                                <Button
                                  variant="light"
                                  color="primary"
                                  isIconOnly
                                  auto
                                  onClick={() => _openProjectAccess(member)}
                                >
                                  <LuBookKey />
                                </Button>
                              </Tooltip>
                            </>
                          )}
                          {_canAccess("teamAdmin") && user.id !== member.id && (
                            <>
                              <Tooltip content="Change member role">
                                <Dropdown>
                                  <DropdownTrigger>
                                    <Button variant="light" auto isIconOnly color="secondary">
                                      <LuUsers2 />
                                    </Button>
                                  </DropdownTrigger>
                                  <DropdownMenu
                                    variant="bordered"
                                    onAction={(key) => _onChangeRole(key, member)}
                                    selectedKeys={[memberRole.role]}
                                    selectionMode="single"
                                  >
                                    {user.id !== member.id
                                      && (_canAccess("teamOwner") || (_canAccess("teamAdmin") && memberRole.role !== "teamOwner"))
                                      && (
                                        <DropdownItem
                                          key="teamAdmin"
                                          textValue="Team Admin"
                                          description={"Full access, but can't delete the team"}
                                        >
                                          <Text>Team Admin</Text>
                                        </DropdownItem>
                                      )}
                                    {user.id !== member.id
                                      && (_canAccess("teamOwner") || (_canAccess("teamAdmin") && memberRole.role !== "teamOwner"))
                                      && (
                                        <DropdownItem
                                          key="projectAdmin"
                                          textValue="Project Admin"
                                          description={"Can create, edit, and remove charts and connections in assigned projects"}
                                        >
                                          <Text>Project Admin</Text>
                                        </DropdownItem>
                                      )}
                                    {user.id !== member.id
                                      && (_canAccess("teamOwner") || (_canAccess("teamAdmin") && memberRole.role !== "teamOwner"))
                                      && (
                                        <DropdownItem
                                          key="projectViewer"
                                          textValue="Project Viewer"
                                          description={"Can view charts in assigned projects"}
                                        >
                                          <Text>Project Viewer</Text>
                                        </DropdownItem>
                                      )}
                                  </DropdownMenu>
                                </Dropdown>
                              </Tooltip>
                            </>
                          )}
                          {user.id !== member.id
                            && (_canAccess("teamOwner") || (_canAccess("teamAdmin") && memberRole.role !== "teamOwner"))
                            && (
                              <Tooltip content="Remove user from the team">
                                <Button
                                  variant="light"
                                  onClick={() => _onDeleteConfirmation(member.id)}
                                  isIconOnly
                                  color="danger"
                                >
                                  <LuXCircle />
                                </Button>
                              </Tooltip>
                            )}
                        </Row>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Segment>

      {/* Remove user modal */}
      <Modal isOpen={!!deleteMember} backdrop="blur" onClose={() => setDeleteMember(false)}>
        <ModalContent>
          <ModalHeader>
            <Text size="h4">Are you sure you want to remove the user from the team?</Text>
          </ModalHeader>
          <ModalBody>
            <p>{"This action will remove the user from the team and restrict them from accessing the dashboards."}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onClick={() => setDeleteMember(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={loading}
              onClick={() => _onDeleteTeamMember(deleteMember)}
              endContent={<LuX />}
            >
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Project access modal */}
      <Modal isOpen={projectModal} onClose={() => setProjectModal(false)} size="4xl">
        <ModalContent>
          <ModalHeader>
            <Text size="h4">Assign project access</Text>
          </ModalHeader>
          <ModalBody>
            {changedMember && projectAccess[changedMember.id] && (
              <>
                <Row>
                  <Text>{"Tick the projects you want to give the user access to. The unticked projects cannot be accessed by this user."}</Text>
                </Row>
                <Row wrap="wrap" align={"center"}>
                  <Text>{"You are currently giving"}</Text>
                  <Spacer x={1} />
                  <Code>{`${projectAccess[changedMember.id].role}`}</Code>
                  <Spacer x={1} />
                  <Text>{`access to ${changedMember.name}`}</Text>
                  <Spacer x={1} />
                  <Text>{"for the following projects:"}</Text>
                </Row>
                <Spacer y={0.5} />

                <div className="grid grid-cols-12 gap-1">
                  {projects && projects.map((project) => (
                    <div className="col-span-12 sm:col-span-6 md:col-span-4" key={project.id}>
                      <Checkbox
                        isSelected={
                          _.indexOf(projectAccess[changedMember.id].projects, project.id) > -1
                        }
                        onChange={() => _onChangeProjectAccess(project.id)}
                      >
                        {project.name}
                      </Checkbox>
                    </div>
                  ))}
                </div>

                <Spacer y={1} />
                <Divider />
                <Spacer y={1} />

                <Row align="center">
                  <Text size={"lg"} b>
                    {"Data export permissions "}
                  </Text>
                  <Spacer x={0.5} />
                  <Tooltip
                    content="The data export can contain sensitive information from your queries that is not necessarily visible on your charts. Only allow the data export when you intend for the users to view this data."
                  >
                    <div><LuInfo /></div>
                  </Tooltip>
                </Row>
                <Row>
                  <Checkbox
                    isSelected={changedRole.canExport}
                    onChange={_onChangeExport}
                  >
                    Allow data export
                  </Checkbox>
                </Row>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onClick={() => setProjectModal(false)}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnVisibilityChange
        draggable
        pauseOnHover
        transition={Flip}
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
}

TeamMembers.defaultProps = {
  style: {},
};

TeamMembers.propTypes = {
  user: PropTypes.object.isRequired,
  style: PropTypes.object,
  cleanErrors: PropTypes.func.isRequired,
  projects: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => {
  return {
    user: state.user.data,
    projects: state.project.data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    cleanErrors: () => dispatch(cleanErrorsAction()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembers);
