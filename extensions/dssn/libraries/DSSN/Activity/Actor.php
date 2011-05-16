<?php
/**
 * An activity actor (group, person, ...)
 *
 * @category   OntoWiki
 * @package    OntoWiki_extensions_components_dssn
 * @copyright  Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */
class DSSN_Activity_Actor extends DSSN_Resource
{
    private $name   = 'no name';
    private $email  = null;
    private $avatar = 'http://l.yimg.com/g/images/buddyicon.jpg'; // default image

    public function getDirectImports() {
        $myImports = array (
            DSSN_AAIR_avatar => 'setAvatar',
            DSSN_AAIR_name   => 'setName',
            DSSN_FOAF_name   => 'setName'
        );
        //return $myImports;
        $parentImports = parent::getDirectImports();
        return array_merge($myImports, $parentImports);
    }
    public function getTurtleTemplate()
    {
        /* default template only a rdf:type statement */
        $template  = <<<EndOfTemplate
            ?resource rdf:type ?type ;
                aair:avatar ?avatar ;
                aair:name ?name .
EndOfTemplate;
        return $template;
    }
    public function getTurtleTemplateVars()
    {
        $vars             = array();
        $vars['resource'] = $this->getIri();
        $vars['type']     = $this->getType();
        $vars['avatar']   = $this->getAvatar();
        $vars['name']     = $this->getName();
        return $vars;
    }

    /**
     * Get avatar.
     *
     * @return avatar.
     */
    public function getAvatar()
    {
        return $this->avatar;
    }

    /**
     * Set avatar.
     *
     * @param avatar the value to set.
     */
    public function setAvatar($avatar)
    {
        $this->avatar = $avatar;
    }

    /**
     * Get email.
     *
     * @return email.
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set email.
     *
     * @param email the value to set.
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * Get name.
     *
     * @return name.
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set name.
     *
     * @param name the value to set.
     */
    public function setName($name)
    {
        $this->name = $name;
    }

}
